from fastapi import FastAPI, APIRouter, UploadFile, File, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_KEY = os.environ.get("JWT_SECRET", "crm-dashboard-secret-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Auth Models ───
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class InviteUser(BaseModel):
    name: str
    email: str
    password: str

# ─── Auth Helpers ───
def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"email": current_user.get("sub")})
    if not user_doc or user_doc.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ─── Auth Routes ───
@api_router.post("/auth/login")
async def login(user: UserLogin):
    doc = await db.users.find_one({"email": user.email})
    if not doc or not pwd_context.verify(user.password, doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": doc["email"], "name": doc["name"], "role": doc.get("role", "user")})
    return {"token": token, "user": {"name": doc["name"], "email": doc["email"], "role": doc.get("role", "user")}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"email": current_user.get("sub")}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {"name": user_doc.get("name"), "email": user_doc.get("email"), "role": user_doc.get("role", "user")}

# ─── Admin Routes ───
@api_router.post("/admin/invite")
async def invite_user(invite: InviteUser, admin: dict = Depends(get_admin_user)):
    existing = await db.users.find_one({"email": invite.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(invite.password)
    doc = {
        "id": str(uuid.uuid4()), "name": invite.name, "email": invite.email,
        "password": hashed, "role": "user",
        "invited_by": admin.get("sub"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(doc)
    return {"message": f"User {invite.email} invited successfully", "user": {"name": invite.name, "email": invite.email, "role": "user"}}

@api_router.get("/admin/users")
async def list_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)
    return {"users": users}

@api_router.delete("/admin/users/{user_email}")
async def remove_user(user_email: str, admin: dict = Depends(get_admin_user)):
    user_doc = await db.users.find_one({"email": user_email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    if user_doc.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot remove admin account")
    await db.users.delete_one({"email": user_email})
    return {"message": f"User {user_email} removed successfully"}

@api_router.put("/admin/users/{user_email}/reset-password")
async def reset_user_password(user_email: str, body: dict, admin: dict = Depends(get_admin_user)):
    new_password = body.get("password")
    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    hashed = pwd_context.hash(new_password)
    result = await db.users.update_one({"email": user_email}, {"$set": {"password": hashed}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Password reset for {user_email}"}

# ─── CSV Upload ───
COLUMN_MAP = {
    0: "account", 1: "order_date", 2: "order_id", 3: "customer_name",
    4: "phone", 5: "alt_phone", 6: "tracking_id",
    7: "ship_by_date", 8: "promised_delivery_date", 9: "actual_ship_date",
    10: "actual_delivery_date", 11: "delivery_time_days", 12: "delivery_status",
    13: "requirement", 14: "installation_updates", 15: "eta", 16: "notes",
    17: "installation_done_by", 18: "sku", 19: "asin", 20: "product_name",
    21: "product_link", 22: "category", 23: "sub_category", 24: "comments",
    25: "delivery_address", 26: "city", 27: "state", 28: "postal_code",
    29: "complaint_date", 30: "complaint_comments", 31: "complaint_type",
    32: "cx_resolution", 33: "three_r_status", 34: "a_to_z_claim",
    35: "replacement_item", 36: "replacement_tracking", 37: "replacement_tracking_status",
    38: "replacement_status_date", 39: "return_item", 40: "return_tracking",
    41: "return_tracking_status", 42: "return_status_date",
    43: "call_status", 44: "feedback_status", 45: "voice_of_customer",
    46: "agent_name", 47: "calling_date"
}

def parse_date(val):
    if not val or not val.strip():
        return None
    for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"]:
        try:
            return datetime.strptime(val.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def parse_int(val):
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None

def parse_row(row):
    doc = {}
    for idx, key in COLUMN_MAP.items():
        if idx < len(row):
            doc[key] = row[idx].strip() if row[idx] else ""
        else:
            doc[key] = ""
    # Parse dates
    for date_field in ["order_date", "ship_by_date", "promised_delivery_date", "actual_ship_date", "actual_delivery_date"]:
        doc[date_field] = parse_date(doc.get(date_field, ""))
    doc["delivery_time_days"] = parse_int(doc.get("delivery_time_days", ""))
    # Determine if delayed: IN TRANSIT and promised delivery date has passed
    status = doc.get("delivery_status", "").upper().strip()
    promised = doc.get("promised_delivery_date")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc["is_delayed"] = False
    if status in ["IN TRANSIT", "OUT FOR DELIVERY", "NO UPDATE", "NO UPDATE", "ATTEMPTED"] and promised and promised < today:
        doc["is_delayed"] = True
    return doc

@api_router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    reader = csv.reader(io.StringIO(text))
    next(reader, None)  # skip group header row
    next(reader, None)  # skip column header row
    
    docs = []
    for row in reader:
        if len(row) < 10 or not row[2].strip():
            continue
        doc = parse_row(row)
        if doc.get("order_id"):
            docs.append(doc)
    
    if not docs:
        raise HTTPException(status_code=400, detail="No valid data found in CSV")
    
    await db.orders.delete_many({})
    if docs:
        await db.orders.insert_many(docs)
    
    count = await db.orders.count_documents({})
    return {"message": f"Uploaded {len(docs)} orders successfully", "count": count}

# ─── Dashboard APIs ───
def build_match_filter(date_from: Optional[str], date_to: Optional[str], product: Optional[str], category: Optional[str], account: Optional[str]):
    match = {}
    if date_from and date_to:
        match["order_date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        match["order_date"] = {"$gte": date_from}
    elif date_to:
        match["order_date"] = {"$lte": date_to}
    if product:
        match["product_name"] = product
    if category:
        match["category"] = category
    if account:
        match["account"] = account
    return match

@api_router.get("/dashboard/summary")
async def dashboard_summary(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    total = await db.orders.count_documents(match)
    
    delivered_match = {**match, "delivery_status": {"$in": ["DELIVERED", "PRIME DELIVERED"]}}
    delivered = await db.orders.count_documents(delivered_match)
    
    transit_match = {**match, "delivery_status": {"$in": ["IN TRANSIT", "OUT FOR DELIVERY"]}}
    in_transit = await db.orders.count_documents(transit_match)
    
    delayed_match = {**match, "is_delayed": True}
    delayed = await db.orders.count_documents(delayed_match)
    
    cancelled_match = {**match, "delivery_status": {"$regex": "(?i)cancel"}}
    cancelled = await db.orders.count_documents(cancelled_match)
    
    refunded_match = {**match, "delivery_status": {"$regex": "(?i)refund"}}
    refunded = await db.orders.count_documents(refunded_match)
    
    return {
        "total_orders": total, "delivered": delivered, "in_transit": in_transit,
        "delayed": delayed, "cancelled": cancelled, "refunded": refunded
    }

@api_router.get("/dashboard/delivery-status")
async def delivery_status(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    pipeline = [
        {"$match": match},
        {"$group": {"_id": "$delivery_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(100)
    data = [{"status": r["_id"] if r["_id"] else "Unknown", "count": r["count"]} for r in results]
    
    delayed_count = await db.orders.count_documents({**match, "is_delayed": True})
    
    return {"breakdown": data, "delayed_count": delayed_count}

@api_router.get("/dashboard/installation-status")
async def installation_status(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    install_match = {**match, "requirement": {"$in": ["Installation Required", "Glass installation required"]}}
    
    pipeline = [
        {"$match": install_match},
        {"$group": {"_id": "$installation_updates", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(100)
    data = [{"status": r["_id"] if r["_id"] else "Unknown", "count": r["count"]} for r in results]
    
    total_requiring = await db.orders.count_documents(install_match)
    pending = await db.orders.count_documents({**install_match, "installation_updates": "Pending"})
    arranged = await db.orders.count_documents({**install_match, "installation_updates": "Arranged"})
    done = await db.orders.count_documents({**install_match, "installation_updates": "Done"})
    
    return {"breakdown": data, "total_requiring": total_requiring, "pending": pending, "arranged": arranged, "done": done}

@api_router.get("/dashboard/feedback-status")
async def feedback_status(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    pipeline = [
        {"$match": {**match, "feedback_status": {"$ne": ""}}},
        {"$group": {"_id": "$feedback_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(100)
    data = [{"status": r["_id"], "count": r["count"]} for r in results]
    
    review_done = await db.orders.count_documents({**match, "feedback_status": {"$regex": "(?i)review done"}})
    happy_count = await db.orders.count_documents({**match, "feedback_status": {"$regex": "(?i)^happy"}})
    
    return {"breakdown": data, "review_done": review_done, "happy_count": happy_count}

@api_router.get("/dashboard/sales-trend")
async def sales_trend(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    match["order_date"] = match.get("order_date", {"$ne": None})
    
    pipeline = [
        {"$match": match},
        {"$addFields": {"month": {"$substr": ["$order_date", 0, 7]}}},
        {"$group": {"_id": "$month", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(100)
    data = [{"month": r["_id"], "orders": r["count"]} for r in results]
    return {"trend": data}

@api_router.get("/dashboard/category-breakdown")
async def category_breakdown(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    pipeline = [
        {"$match": {**match, "category": {"$ne": ""}}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.orders.aggregate(pipeline).to_list(50)
    data = [{"category": r["_id"], "count": r["count"]} for r in results]
    return {"breakdown": data}

@api_router.get("/dashboard/state-breakdown")
async def state_breakdown(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)
    pipeline = [
        {"$match": {**match, "state": {"$ne": ""}}},
        {"$addFields": {"state_upper": {"$toUpper": "$state"}}},
        {"$group": {"_id": "$state_upper", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]
    results = await db.orders.aggregate(pipeline).to_list(20)
    data = [{"state": r["_id"], "count": r["count"]} for r in results]
    return {"breakdown": data}

@api_router.get("/dashboard/filters")
async def get_filters(current_user: dict = Depends(get_current_user)):
    products = await db.orders.distinct("product_name")
    products = sorted([p for p in products if p])
    categories = await db.orders.distinct("category")
    categories = sorted([c for c in categories if c and c != "#N/A"])
    accounts = await db.orders.distinct("account")
    accounts = sorted([a for a in accounts if a])
    
    date_range = await db.orders.aggregate([
        {"$match": {"order_date": {"$ne": None}}},
        {"$group": {"_id": None, "min_date": {"$min": "$order_date"}, "max_date": {"$max": "$order_date"}}}
    ]).to_list(1)
    
    min_date = date_range[0]["min_date"] if date_range else None
    max_date = date_range[0]["max_date"] if date_range else None
    
    return {"products": products, "categories": categories, "accounts": accounts, "min_date": min_date, "max_date": max_date}

@api_router.get("/dashboard/orders")
async def get_orders(
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    product: Optional[str] = None, category: Optional[str] = None,
    account: Optional[str] = None,
    delivery_status_filter: Optional[str] = None,
    installation_filter: Optional[str] = None,
    feedback_filter: Optional[str] = None,
    is_delayed: Optional[bool] = None,
    page: int = 1, page_size: int = 50,
    current_user: dict = Depends(get_current_user)
):
    match = build_match_filter(date_from, date_to, product, category, account)

    if delivery_status_filter:
        if delivery_status_filter == "__all_delivered__":
            match["delivery_status"] = {"$in": ["DELIVERED", "PRIME DELIVERED"]}
        elif delivery_status_filter == "__all_transit__":
            match["delivery_status"] = {"$in": ["IN TRANSIT", "OUT FOR DELIVERY"]}
        elif delivery_status_filter == "__all_cancelled__":
            match["delivery_status"] = {"$regex": "(?i)cancel"}
        elif delivery_status_filter == "__all_refunded__":
            match["delivery_status"] = {"$regex": "(?i)refund"}
        else:
            match["delivery_status"] = delivery_status_filter

    if is_delayed is True:
        match["is_delayed"] = True

    if installation_filter:
        match["requirement"] = {"$in": ["Installation Required", "Glass installation required"]}
        match["installation_updates"] = installation_filter

    if feedback_filter:
        match["feedback_status"] = feedback_filter

    total = await db.orders.count_documents(match)
    skip = (page - 1) * page_size

    projection = {
        "_id": 0, "order_id": 1, "order_date": 1, "customer_name": 1,
        "tracking_id": 1, "delivery_status": 1, "is_delayed": 1,
        "promised_delivery_date": 1, "actual_ship_date": 1, "actual_delivery_date": 1,
        "delivery_time_days": 1, "product_name": 1, "category": 1,
        "state": 1, "city": 1, "phone": 1,
        "requirement": 1, "installation_updates": 1, "eta": 1,
        "feedback_status": 1, "call_status": 1, "voice_of_customer": 1,
        "account": 1, "agent_name": 1, "sub_category": 1
    }

    orders = await db.orders.find(match, projection).sort("order_date", -1).skip(skip).limit(page_size).to_list(page_size)

    return {
        "orders": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@api_router.get("/dashboard/data-status")
async def data_status(current_user: dict = Depends(get_current_user)):
    count = await db.orders.count_documents({})
    return {"has_data": count > 0, "total_records": count}

# ─── Seed CSV on startup + Admin account ───
@app.on_event("startup")
async def seed_data():
    # Ensure admin account exists
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@crm.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    admin_exists = await db.users.find_one({"email": admin_email})
    if not admin_exists:
        hashed = pwd_context.hash(admin_password)
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "Admin", "email": admin_email,
            "password": hashed, "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin account created: {admin_email}")
    else:
        # Ensure existing admin has role field
        if admin_exists.get("role") != "admin":
            await db.users.update_one({"email": admin_email}, {"$set": {"role": "admin"}})

    # Upgrade existing test user to admin if present (for backward compat)
    test_user = await db.users.find_one({"email": "test@test.com"})
    if test_user and not test_user.get("role"):
        await db.users.update_one({"email": "test@test.com"}, {"$set": {"role": "admin"}})

    # Seed CSV data
    count = await db.orders.count_documents({})
    csv_path = ROOT_DIR / "crm_data.csv"
    if count == 0 and csv_path.exists():
        logger.info("Seeding data from crm_data.csv...")
        with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            next(reader, None)
            next(reader, None)
            docs = []
            for row in reader:
                if len(row) < 10 or not row[2].strip():
                    continue
                doc = parse_row(row)
                if doc.get("order_id"):
                    docs.append(doc)
            if docs:
                batch_size = 5000
                for i in range(0, len(docs), batch_size):
                    await db.orders.insert_many(docs[i:i+batch_size])
                logger.info(f"Seeded {len(docs)} orders")
        await db.orders.create_index("order_date")
        await db.orders.create_index("delivery_status")
        await db.orders.create_index("category")
        await db.orders.create_index("product_name")
        await db.orders.create_index("state")
        await db.orders.create_index("account")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
