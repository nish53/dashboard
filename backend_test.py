import requests
import sys
from datetime import datetime
import json

class CRMBackendTester:
    def __init__(self, base_url="https://sales-tracker-661.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            request_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers)

            success = response.status_code == expected_status
            result = {
                "test": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    result["response_data"] = response_data
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_response = response.json()
                    result["error_response"] = error_response
                    print(f"   Error: {error_response}")
                except:
                    result["error_response"] = response.text
                    print(f"   Raw Error: {response.text}")

            self.test_results.append(result)
            return success, result.get("response_data", {})

        except Exception as e:
            print(f"❌ Failed - Exception: {str(e)}")
            result = {
                "test": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "success": False,
                "exception": str(e)
            }
            self.test_results.append(result)
            return False, {}

    # Auth Tests
    def test_user_registration(self, name="Test User", email="testuser@example.com", password="testpass123"):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"name": name, "email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Registered user: {response.get('user', {}).get('name')}")
            return True
        return False

    def test_user_login(self, email="test@test.com", password="test123"):
        """Test user login with provided credentials"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Logged in user: {response.get('user', {}).get('name')}")
            return True
        return False

    def test_auth_me(self):
        """Test protected route /auth/me"""
        if not self.token:
            print("❌ No token available for auth test")
            return False
        
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   User info: {response}")
        return success

    # Dashboard API Tests
    def test_dashboard_summary(self):
        """Test dashboard summary API"""
        return self.run_test(
            "Dashboard Summary",
            "GET",
            "dashboard/summary",
            200
        )[0]

    def test_delivery_status(self):
        """Test delivery status API"""
        return self.run_test(
            "Delivery Status",
            "GET",
            "dashboard/delivery-status",
            200
        )[0]

    def test_installation_status(self):
        """Test installation status API"""
        return self.run_test(
            "Installation Status",
            "GET",
            "dashboard/installation-status",
            200
        )[0]

    def test_feedback_status(self):
        """Test feedback status API"""
        return self.run_test(
            "Feedback Status",
            "GET",
            "dashboard/feedback-status",
            200
        )[0]

    def test_sales_trend(self):
        """Test sales trend API"""
        return self.run_test(
            "Sales Trend",
            "GET",
            "dashboard/sales-trend",
            200
        )[0]

    def test_category_breakdown(self):
        """Test category breakdown API"""
        return self.run_test(
            "Category Breakdown",
            "GET",
            "dashboard/category-breakdown",
            200
        )[0]

    def test_state_breakdown(self):
        """Test state breakdown API"""
        return self.run_test(
            "State Breakdown",
            "GET",
            "dashboard/state-breakdown",
            200
        )[0]

    def test_filters(self):
        """Test filters API"""
        success, response = self.run_test(
            "Dashboard Filters",
            "GET",
            "dashboard/filters",
            200
        )
        if success:
            products_count = len(response.get('products', []))
            categories_count = len(response.get('categories', []))
            accounts_count = len(response.get('accounts', []))
            print(f"   Filters: {products_count} products, {categories_count} categories, {accounts_count} accounts")
        return success

    def test_data_status(self):
        """Test data status API"""
        success, response = self.run_test(
            "Data Status",
            "GET",
            "dashboard/data-status",
            200
        )
        if success:
            print(f"   Data status: {response}")
        return success

    # Filter Tests
    def test_date_filtering(self):
        """Test date range filtering"""
        return self.run_test(
            "Date Range Filtering",
            "GET",
            "dashboard/summary",
            200,
            data={"date_from": "2024-01-01", "date_to": "2024-12-31"}
        )[0]

    def test_product_filtering(self):
        """Test product filtering"""
        # First get available products
        success, filters_response = self.run_test(
            "Get Products for Filtering",
            "GET",
            "dashboard/filters",
            200
        )
        
        if success and filters_response.get('products'):
            first_product = filters_response['products'][0]
            return self.run_test(
                "Product Filtering",
                "GET",
                "dashboard/summary",
                200,
                data={"product": first_product}
            )[0]
        return False

    # NEW TESTS FOR ITERATION 2 - Interactive Features
    def test_orders_endpoint_basic(self):
        """Test basic orders endpoint functionality"""
        success, response = self.run_test(
            "Orders Endpoint Basic",
            "GET",
            "dashboard/orders",
            200,
            data={"page": 1, "page_size": 10}
        )
        
        if success:
            # Verify response structure
            required_keys = ["orders", "total", "page", "page_size", "total_pages"]
            if all(key in response for key in required_keys):
                print(f"   ✓ Response structure valid")
                
                # Check if orders have required fields
                if response.get("orders") and len(response["orders"]) > 0:
                    order = response["orders"][0]
                    required_fields = ["order_id", "customer_name", "tracking_id", "promised_delivery_date", "actual_ship_date"]
                    missing_fields = [f for f in required_fields if f not in order or order[f] is None]
                    if missing_fields:
                        print(f"   ⚠️ Missing required fields: {missing_fields}")
                    else:
                        print(f"   ✓ All required fields present in orders")
                        
                print(f"   Orders returned: {len(response['orders'])}, Total: {response.get('total', 0)}")
            else:
                print(f"   ❌ Invalid response structure. Missing keys: {[k for k in required_keys if k not in response]}")
        
        return success

    def test_orders_delivery_status_filter(self):
        """Test orders endpoint with delivery_status_filter"""
        # Test with specific delivery status
        success1, response1 = self.run_test(
            "Orders - Delivery Status Filter (DELIVERED)",
            "GET",
            "dashboard/orders",
            200,
            data={"delivery_status_filter": "__all_delivered__", "page": 1, "page_size": 5}
        )
        
        success2, response2 = self.run_test(
            "Orders - Delivery Status Filter (IN TRANSIT)",
            "GET",
            "dashboard/orders",
            200,
            data={"delivery_status_filter": "__all_transit__", "page": 1, "page_size": 5}
        )
        
        if success1 and success2:
            print(f"   Delivered orders: {response1.get('total', 0)}, Transit orders: {response2.get('total', 0)}")
        
        return success1 and success2

    def test_orders_delayed_filter(self):
        """Test orders endpoint with is_delayed=true param"""
        success, response = self.run_test(
            "Orders - Delayed Filter",
            "GET",
            "dashboard/orders",
            200,
            data={"is_delayed": "true", "page": 1, "page_size": 5}
        )
        
        if success:
            delayed_count = response.get('total', 0)
            print(f"   Delayed orders found: {delayed_count}")
            
            # Verify all returned orders are actually delayed
            if response.get("orders"):
                for order in response["orders"]:
                    if not order.get("is_delayed"):
                        print(f"   ⚠️ Found non-delayed order in delayed filter results: {order.get('order_id')}")
                        return False
                print(f"   ✓ All {len(response['orders'])} returned orders are marked as delayed")
        
        return success

    def test_orders_installation_filter(self):
        """Test orders endpoint with installation_filter param"""
        # Get available installation statuses first
        success_status, status_response = self.run_test(
            "Installation Status for Filter Test",
            "GET",
            "dashboard/installation-status",
            200
        )
        
        if success_status and status_response.get('breakdown'):
            # Try to find a status with orders
            for status_item in status_response['breakdown'][:2]:  # Test first 2 statuses
                status = status_item['status']
                success, response = self.run_test(
                    f"Orders - Installation Filter ({status})",
                    "GET",
                    "dashboard/orders",
                    200,
                    data={"installation_filter": status, "page": 1, "page_size": 5}
                )
                
                if success:
                    print(f"   Installation '{status}' orders: {response.get('total', 0)}")
                    return True
        
        return False

    def test_orders_feedback_filter(self):
        """Test orders endpoint with feedback_filter param"""
        # Get available feedback statuses first
        success_status, status_response = self.run_test(
            "Feedback Status for Filter Test",
            "GET",
            "dashboard/feedback-status",
            200
        )
        
        if success_status and status_response.get('breakdown'):
            # Try to find a status with orders
            for status_item in status_response['breakdown'][:2]:  # Test first 2 statuses
                status = status_item['status']
                success, response = self.run_test(
                    f"Orders - Feedback Filter ({status})",
                    "GET",
                    "dashboard/orders",
                    200,
                    data={"feedback_filter": status, "page": 1, "page_size": 5}
                )
                
                if success:
                    print(f"   Feedback '{status}' orders: {response.get('total', 0)}")
                    return True
        
        return False

    def test_orders_pagination(self):
        """Test orders endpoint pagination functionality"""
        # Test page 1
        success1, response1 = self.run_test(
            "Orders - Pagination Page 1",
            "GET",
            "dashboard/orders",
            200,
            data={"page": 1, "page_size": 10}
        )
        
        # Test page 2 
        success2, response2 = self.run_test(
            "Orders - Pagination Page 2",
            "GET",
            "dashboard/orders",
            200,
            data={"page": 2, "page_size": 10}
        )
        
        if success1 and success2:
            # Verify different results
            orders1_ids = [o.get('order_id') for o in response1.get('orders', [])]
            orders2_ids = [o.get('order_id') for o in response2.get('orders', [])]
            
            if len(set(orders1_ids) & set(orders2_ids)) == 0:
                print(f"   ✓ Page 1 and Page 2 return different orders")
            else:
                print(f"   ⚠️ Page 1 and Page 2 have overlapping orders")
            
            print(f"   Page 1: {len(response1.get('orders', []))} orders, Page 2: {len(response2.get('orders', []))} orders")
            print(f"   Total available: {response1.get('total', 0)}, Total pages: {response1.get('total_pages', 0)}")
        
        return success1 and success2
    
    # SPECIFIC TESTS FROM REVIEW REQUEST
    def test_specific_delivered_filter(self):
        """Test specific delivery_status_filter=__all_delivered__ returns delivered orders"""
        success, response = self.run_test(
            "SPECIFIC: delivery_status_filter=__all_delivered__",
            "GET",
            "dashboard/orders",
            200,
            data={"delivery_status_filter": "__all_delivered__", "page": 1, "page_size": 10}
        )
        
        if success:
            print(f"   Delivered orders total: {response.get('total', 0)}")
            # Verify all returned orders have delivered status
            if response.get("orders"):
                for order in response["orders"]:
                    status = order.get("delivery_status", "").upper()
                    if "DELIVERED" not in status:
                        print(f"   ⚠️ Non-delivered order found: {order.get('order_id')} - Status: {status}")
                        return False
                print(f"   ✓ All {len(response['orders'])} returned orders have DELIVERED status")
        
        return success
    
    def test_specific_delayed_filter(self):
        """Test specific is_delayed=true returns delayed orders"""
        success, response = self.run_test(
            "SPECIFIC: is_delayed=true",
            "GET",
            "dashboard/orders",
            200,
            data={"is_delayed": True, "page": 1, "page_size": 10}
        )
        
        if success:
            print(f"   Delayed orders total: {response.get('total', 0)}")
            # Verify all returned orders are delayed
            if response.get("orders"):
                for order in response["orders"]:
                    if not order.get("is_delayed"):
                        print(f"   ⚠️ Non-delayed order found: {order.get('order_id')}")
                        return False
                print(f"   ✓ All {len(response['orders'])} returned orders are marked as delayed")
        
        return success
    
    def test_specific_installation_pending(self):
        """Test specific installation_filter=Pending returns pending installs"""
        success, response = self.run_test(
            "SPECIFIC: installation_filter=Pending",
            "GET",
            "dashboard/orders",
            200,
            data={"installation_filter": "Pending", "page": 1, "page_size": 10}
        )
        
        if success:
            print(f"   Pending installation orders total: {response.get('total', 0)}")
            # Verify all returned orders have pending installation
            if response.get("orders"):
                for order in response["orders"]:
                    if order.get("installation_updates", "").lower() != "pending":
                        print(f"   ⚠️ Non-pending installation order found: {order.get('order_id')} - Status: {order.get('installation_updates')}")
                        return False
                print(f"   ✓ All {len(response['orders'])} returned orders have Pending installation status")
        
        return success
    
    def test_specific_feedback_happy(self):
        """Test specific feedback_filter=Happy returns happy feedback orders"""
        success, response = self.run_test(
            "SPECIFIC: feedback_filter=Happy",
            "GET",
            "dashboard/orders",
            200,
            data={"feedback_filter": "Happy", "page": 1, "page_size": 10}
        )
        
        if success:
            print(f"   Happy feedback orders total: {response.get('total', 0)}")
            # Verify all returned orders have happy feedback
            if response.get("orders"):
                for order in response["orders"]:
                    feedback = order.get("feedback_status", "").lower()
                    if "happy" not in feedback:
                        print(f"   ⚠️ Non-happy feedback order found: {order.get('order_id')} - Feedback: {order.get('feedback_status')}")
                        return False
                print(f"   ✓ All {len(response['orders'])} returned orders have Happy feedback")
        
        return success
    
    def test_specific_pagination_pages(self):
        """Test specific pagination with page=1 and page=2"""
        # Test page 1
        success1, response1 = self.run_test(
            "SPECIFIC: Pagination page=1",
            "GET",
            "dashboard/orders",
            200,
            data={"page": 1, "page_size": 50}
        )
        
        # Test page 2
        success2, response2 = self.run_test(
            "SPECIFIC: Pagination page=2", 
            "GET",
            "dashboard/orders",
            200,
            data={"page": 2, "page_size": 50}
        )
        
        if success1 and success2:
            print(f"   Page 1 orders: {len(response1.get('orders', []))}, Page 2 orders: {len(response2.get('orders', []))}")
            print(f"   Total records: {response1.get('total', 0)}")
            
            # Verify pages are different
            page1_ids = set(order.get('order_id') for order in response1.get('orders', []))
            page2_ids = set(order.get('order_id') for order in response2.get('orders', []))
            
            if page1_ids.intersection(page2_ids):
                print(f"   ⚠️ Overlapping orders between pages")
                return False
            else:
                print(f"   ✓ Pages contain different orders (no overlap)")
        
        return success1 and success2

def main():
    print("🚀 Starting CRM Backend API Tests")
    print("=" * 50)
    
    tester = CRMBackendTester()
    
    # Test 1: Login with provided credentials
    print("\n📋 AUTHENTICATION TESTS")
    login_success = tester.test_user_login("test@test.com", "test123")
    
    if not login_success:
        print("\n❌ Login failed - stopping further tests that require authentication")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1
    
    # Test protected route
    tester.test_auth_me()
    
    # Test 2: Dashboard APIs
    print("\n📈 DASHBOARD API TESTS")
    tester.test_dashboard_summary()
    tester.test_delivery_status()
    tester.test_installation_status()
    tester.test_feedback_status()
    tester.test_sales_trend()
    tester.test_category_breakdown()
    tester.test_state_breakdown()
    tester.test_filters()
    tester.test_data_status()
    
    # Test 3: Filtering
    print("\n🔍 FILTERING TESTS")
    tester.test_date_filtering()
    tester.test_product_filtering()
    
    # Test 4: NEW Interactive Features (Orders Endpoint)
    print("\n🎯 INTERACTIVE FEATURES TESTS (Orders Endpoint)")
    tester.test_orders_endpoint_basic()
    tester.test_orders_delivery_status_filter()
    tester.test_orders_delayed_filter()
    tester.test_orders_installation_filter()
    tester.test_orders_feedback_filter()
    tester.test_orders_pagination()
    
    # Test 5: SPECIFIC TESTS FROM REVIEW REQUEST
    print("\n🎯 SPECIFIC REQUIRED TESTS FROM REVIEW REQUEST")
    tester.test_specific_delivered_filter()
    tester.test_specific_delayed_filter()
    tester.test_specific_installation_pending()
    tester.test_specific_feedback_happy()
    tester.test_specific_pagination_pages()
    
    # Print final results
    print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️ Some backend tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())