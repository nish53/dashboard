# CRM Dashboard - PRD

## Problem Statement
Build a CRM Dashboard for an e-commerce furniture business. Dashboard displays data from CSV upload with metrics: Delivery Status (in transit, delivered, delayed), Installation Status (pending, arranged), Review Status, date/product slicers, and general sales analytics with pie charts and line graphs.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (orders, users collections)
- **Auth**: JWT-based (email/password)

## User Personas
- Business owner/manager tracking e-commerce CRM data
- Furniture brand operators (RK Wooden Arts, Sona Art & Crafts)

## Core Requirements
- JWT Authentication (register/login)
- CSV Upload for data refresh
- Dashboard with KPI cards, pie charts, line graphs
- Date range filter (quick buttons + calendar pickers)
- Product, Category, Account filters
- Delivery Status tracking (delivered, in transit, delayed)
- Installation Status (pending, arranged, done)
- Review/Feedback Status
- Sales trend by month
- Category breakdown
- State-wise sales distribution

## What's Been Implemented (Feb 23, 2026)
- Full JWT auth (register/login/protected routes)
- CSV auto-seeding on startup (9,207 orders)
- CSV upload with drag-drop modal
- Dashboard with 6 KPI cards, 6 chart sections
- Filter bar: 7D/30D/90D/6M quick dates, calendar pickers, product/category/account dropdowns
- **Product filter with type-to-search** functionality
- All dashboard APIs with filter support
- **Interactive metrics**: Click any KPI card to see detailed orders
- **Interactive pie charts**: Click any segment to drill down into order details
- **Interactive badges**: Click Pending/Arranged/Done/Happy/Review Done badges
- **Order details slide-out panel** with full order table (Order ID, Customer, Tracking ID, Promised Date, Dispatch Date, etc.) and pagination
- Backend `/api/dashboard/orders` endpoint with flexible filtering
- Modern UI: Manrope/Inter fonts, warm color palette, Bento grid layout

## Test Results
- Backend: 100% (14/14 API endpoints passing)
- Frontend: 90%+ (all core features working)

## Prioritized Backlog
### P0 (Done)
- [x] Auth system
- [x] CSV upload & seeding
- [x] All dashboard metrics & charts
- [x] Filter/slicer functionality

### P1 (Next)
- [ ] Data table view with sort/filter (Tanstack Table)
- [ ] Export to CSV/PDF
- [ ] More granular date filtering (weekly view)

### P2 (Future)
- [ ] Real-time auto-refresh with interval
- [ ] Role-based access (admin vs viewer)
- [ ] Email alerts for delayed orders
- [ ] Mobile-optimized views
