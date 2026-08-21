# YieldSense AI Role-Based Feature Matrix

This document summarizes the Farmer, Analyst, and Admin roles in YieldSense AI and lists the implemented pages, APIs, and working features for each role.

---

## 1. Farmer Role

### Core goals
- Manage farms and crop records
- Run yield predictions
- Monitor weather and soil health
- View recommendations and risks
- Generate reports and notifications
- Use the AI advisor

### Frontend pages

| Page | Route | Status | Notes |
| --- | --- | --- | --- |
| Auth / Login | `/auth` | ✅ | Role-based redirect to farmer, analyst, or admin landing pages |
| Dashboard | `/dashboard` | ✅ | Shows farm summary, weather, latest prediction, alerts, recommendations |
| Farms | `/farms` | ✅ | Farm create, edit, delete, search, summary cards |
| Prediction | `/predict` | ✅ | Yield prediction form and results card |
| Weather | `/weather` | ✅ | Weather dashboard, forecast, advisory, current conditions |
| Soil Analysis | `/soil` | ✅ | Soil input form, fertility score, deficiency recommendations |
| Recommendations | `/recommendations` | ✅ | Crop, irrigation, fertilizer recommendations |
| Risk Assessment | `/risk` | ✅ | Current risk, disease risk, profit risk form |
| Reports | `/reports` | ✅ | Prediction, farm, weather, soil reports, CSV export |
| Analytics | `/analytics` | ✅ | Dashboard analytics, yield trends, farm comparisons |
| GIS / Map | `/map` | ✅ | Farm location visualization and GIS data |
| AI Advisor | `/advisor` | ✅ | AI chat, daily tasks, crop calendar |
| Alerts | `/alerts` | ✅ | Alerts list page and mark-as-read actions |
| Notifications | `/notifications` | ✅ | Notification list, unread count, mark read |

### Backend APIs used by farmer pages

| Feature | Endpoint | Status |
| --- | --- | --- |
| Register | `POST /api/v1/auth/register` | ✅ |
| Login | `POST /api/v1/auth/login` | ✅ |
| Profile | `GET /api/v1/users/me` | ✅ |
| Update Profile | `PUT /api/v1/users/me` | ✅ |
| Farm CRUD | `/api/v1/farms` | ✅ |
| Crop Data | `/api/v1/data/farms/{farm_id}/crops` | ✅ |
| Predict Yield | `POST /api/v1/predictions/predict` | ✅ |
| Prediction History | `GET /api/v1/predictions/history` | ✅ |
| Farm Predictions | `GET /api/v1/predictions/farm/{farm_id}` | ✅ |
| Model Metrics | `GET /api/v1/predictions/model/metrics` | ✅ |
| Available Crops | `GET /api/v1/predictions/crops/available` | ✅ |
| Current Weather | `GET /api/v1/weather/current` | ✅ |
| Weather Forecast | `GET /api/v1/weather/forecast` | ✅ |
| Hourly Weather | `GET /api/v1/weather/hourly` | ✅ |
| Weather History | `GET /api/v1/weather/history` | ✅ |
| Weather Alerts | `GET /api/v1/weather/alerts` | ✅ |
| Weather Risk | `GET /api/v1/weather/risk` | ✅ |
| Weather Advisory | `GET /api/v1/weather/advisory` | ✅ |
| Weather Dashboard | `GET /api/v1/weather/dashboard` | ✅ |
| Soil Analyze | `POST /api/v1/soil/analyze` | ✅ |
| Soil Types | `GET /api/v1/soil/types` | ✅ |
| Fertility Guide | `GET /api/v1/soil/fertility-guide` | ✅ |
| Crop Recommendation | `POST /api/v1/soil/crop-recommendation` | ✅ |
| Soil History | `GET /api/v1/soil/history` | ✅ |
| Farm Soil History | `GET /api/v1/soil/history/{farm_id}` | ✅ |
| Soil Health Score | `GET /api/v1/soil/health-score/{farm_id}` | ✅ |
| Recommendation List | `GET /api/v1/recommendations/` | ✅ |
| Generate Recommendations | `POST /api/v1/recommendations/generate` | ✅ |
| Crop Advice | `GET /api/v1/recommendations/crop` | ✅ |
| Irrigation Plan | `GET /api/v1/recommendations/irrigation` | ✅ |
| Fertilizer Plan | `GET /api/v1/recommendations/fertilizer` | ✅ |
| Risk Assessment | `GET /api/v1/risk/assessment` | ✅ |
| Disease Risk | `GET /api/v1/risk/disease` | ✅ |
| Profit Risk | `GET /api/v1/risk/profit` | ✅ |
| Prediction Report | `GET /api/v1/reports/prediction-summary` | ✅ |
| Farm Report | `GET /api/v1/reports/farm-report` | ✅ |
| Weather Report | `GET /api/v1/reports/weather-report` | ✅ |
| Soil Report | `GET /api/v1/reports/soil-report` | ✅ |
| Export CSV | `GET /api/v1/reports/export/csv` | ✅ |
| AI Advisor Chat | `POST /api/v1/advisor/chat` | ✅ |
| Advisor Tasks | `GET /api/v1/advisor/tasks` | ✅ |
| Advisor Insights | `GET /api/v1/advisor/insights` | ✅ |
| Crop Calendar | `GET /api/v1/advisor/calendar` | ✅ |
| Alerts List | `GET /api/v1/alerts/` | ✅ |
| Mark Alert Read | `PUT /api/v1/alerts/read/{alert_id}` | ✅ |
| Mark All Alerts Read | `PUT /api/v1/alerts/read-all` | ✅ |
| Delete Alert | `DELETE /api/v1/alerts/{alert_id}` | ✅ |
| Weather Alerts | `GET /api/v1/alerts/weather-alerts` | ✅ |
| Notifications | `GET /api/v1/notifications/` | ✅ |
| Unread Count | `GET /api/v1/notifications/unread-count` | ✅ |
| Mark Notification Read | `PUT /api/v1/notifications/{notification_id}/read` | ✅ |
| Mark All Notifications Read | `PUT /api/v1/notifications/read-all` | ✅ |
| Delete Notification | `DELETE /api/v1/notifications/{notification_id}` | ✅ |
| GIS Farm Locations | `GET /api/v1/gis/farms/locations` | ✅ |
| Soil Zones | `GET /api/v1/gis/soil-zones` | ✅ |
| Nearby Stations | `GET /api/v1/gis/nearby-stations` | ✅ |

### Notes
- The Farmer experience is fully implemented and the pages are functional with backend integration.
- Most Farmer pages already use actual backend responses instead of placeholder content.
- The app's farmer dashboard, farm management, weather, soil, prediction, and reports features are complete.

---

## 2. Analyst Role

### Core goals
- View cross-farm analytics and trends
- Compare farms and crop performance
- Analyze productivity and risk distribution
- Generate analyst reports and insights

### Frontend pages

| Page | Route | Status | Notes |
| --- | --- | --- | --- |
| Analyst Dashboard | `/analyst` | ✅ | Aggregated analytics and tiles |
| Yield Trends | `/analyst/yield-trends` | 🟡 | Some chart logic present; needs full data integration |
| Crop Performance | `/analyst/crop-performance` | 🟡 | Table/list present; connect to actual analytics response |
| Farm Comparison | `/analyst/farm-comparison` | 🟡 | Data page exists; polish and use backend data |
| Productivity | `/analyst/productivity` | 🟡 | UI exists; verify API values display correctly |
| Risk Distribution | `/analyst/risk` or `/analyst/risk-distribution` | 🟡 | API exists; needs UI polish |
| Weather Analysis | `/analyst/weather` | 🟡 | Analytics page present; connect to backend data |
| Soil Analysis | `/analyst/soil` | 🟡 | UI present; verify response mapping |
| Reports | `/analyst/reports` | 🟡 | Present but may need better report rendering |
| Analyst Dashboard (alternate) | `/analyst/dashboard` | ✅ | Additional analyst view exists |

### Backend APIs used by analyst pages

| Feature | Endpoint | Status |
| --- | --- | --- |
| Analyst Dashboard | `GET /api/v1/analyst/dashboard` | ✅ |
| Yield Trends | `GET /api/v1/analyst/yield-trends` | ✅ |
| Crop Performance | `GET /api/v1/analyst/crop-performance` | ✅ |
| Weather Impact | `GET /api/v1/analyst/weather-impact` | ✅ |
| Soil Analysis | `GET /api/v1/analyst/soil-analysis` | ✅ |
| Farm Comparison | `GET /api/v1/analyst/farm-comparison` | ✅ |
| Productivity | `GET /api/v1/analyst/productivity` | ✅ |
| Risk Distribution | `GET /api/v1/analyst/risk-distribution` | ✅ |
| Recent Predictions | `GET /api/v1/analyst/recent-predictions` | ✅ |
| Analyst Reports | `GET /api/v1/analyst/reports` | ✅ |

### Notes
- The Analyst backend is complete and provides all required analytics endpoints.
- The Analyst frontend pages are mostly present, but a few pages should be polished and connected to data.
- Focus on removing placeholder content, adding chart visualizations, and ensuring the analytics data flows through.

---

## 3. Admin Role

### Core goals
- Manage users, farms, and predictions
- Monitor system health, model performance, and reports
- Export data for analysis and review

### Frontend pages

| Page | Route | Status | Notes |
| --- | --- | --- | --- |
| Admin Dashboard | `/admin` | 🟡 | Summary widgets present; polish for full dashboard view |
| User Management | `/admin/users` | 🟡 | page exists; ensure list and role actions work |
| Farms Management | `/admin/farms` | 🟡 | page exists; connect admin farm list and delete actions |
| Model Monitoring | `/admin/models` | 🟡 | model info and retrain UI present |
| Reports | `/admin/reports` | 🟡 | admin report page exists; polish export buttons |
| Settings | `/admin/settings` | 🟡 | placeholder settings page |

### Backend APIs used by admin pages

| Feature | Endpoint | Status |
| --- | --- | --- |
| Admin Dashboard | `GET /api/v1/admin/dashboard` | ✅ |
| System Stats | `GET /api/v1/admin/stats` | ✅ |
| List Users | `GET /api/v1/admin/users` | ✅ |
| Get User | `GET /api/v1/admin/users/{id}` | ✅ |
| Update User Role | `PUT /api/v1/admin/users/{id}/role` | ✅ |
| Delete User | `DELETE /api/v1/admin/users/{id}` | ✅ |
| List Farms | `GET /api/v1/admin/farms` | ✅ |
| Get Farm | `GET /api/v1/admin/farms/{id}` | ✅ |
| Delete Farm | `DELETE /api/v1/admin/farms/{id}` | ✅ |
| List Predictions | `GET /api/v1/admin/predictions` | ✅ |
| Get Prediction | `GET /api/v1/admin/predictions/{id}` | ✅ |
| Delete Prediction | `DELETE /api/v1/admin/predictions/{id}` | ✅ |
| Admin Reports | `GET /api/v1/admin/reports` | ✅ |
| Export CSV | `GET /api/v1/admin/reports/export/csv` | ✅ |
| Model Metrics | `GET /api/v1/admin/model` | ✅ |
| System Health | `GET /api/v1/admin/system` | ✅ |
| Activity Feed | `GET /api/v1/admin/activity` | ✅ |

### Notes
- The Admin backend is feature-rich and nearly complete.
- The Admin frontend needs a few management pages to fully reflect the APIs.
- Existing page skeletons should be connected to the API endpoints and improved for usability.

---

## 4. Shared Platform Features

### Authentication & RBAC
- JWT authentication is implemented in the backend.
- Role-based access control is enforced using permissions and role checks.
- Frontend role redirect is implemented from the login page.

### Data Models
- Users
- Farms
- Crops
- Predictions
- Soil Analyses
- Notifications
- Alerts
- Analytics summary objects

### API conventions
- All endpoints are under `/api/v1/`
- Frontend uses `frontend/lib/api.ts` for fetch requests
- Authentication header: `Authorization: Bearer <token>`

---

## 5. Working Status Summary

| Role | Status | Notes |
| --- | --- | --- |
| Farmer | ✅ 100% | All farmer-facing pages exist and use backend integration. |
| Analyst | 🟡 90% | Backend complete; frontend needs polish and chart/data integration. |
| Admin | 🟡 85% | Backend nearly complete; frontend management pages need completion. |

---

## 6. What is fully working today?

### Farmer
- Authentication and role guard
- Farm creation, listing, editing, deletion
- Crop data submission
- Yield prediction and prediction history
- Weather intelligence and dashboard
- Soil analysis and health scoring
- Crop recommendations, irrigation, fertilizer plans
- Risk assessment and disease/profit calculations
- Reports and CSV export
- Alerts and notifications pages
- GIS map flows and data fetch
- AI advisor chat and crop calendar

### Analyst
- Analytics endpoints are already available
- Summary analytics and dashboard pages are present
- Trend and comparison page shells exist

### Admin
- User/farm/prediction management API endpoints are available
- Admin dashboard API is available
- Admin CSV export is available
- Model info and system health endpoints are available

---

## 7. Where to focus next

### Farmer priority
- Keep the farmer workflow polished and data-driven.
- Verify all forms and backend calls.

### Analyst priority
- Connect all analyst pages to actual analytics API responses.
- Add charts and remove placeholder values.

### Admin priority
- Finish user management, farm management, prediction management, and admin dashboard UI.
- Add pagination/search if the lists are long.

---

## 8. Usage guidance for developers

### Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### Start the backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Configure frontend API base
Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
```

---

## 9. Recommended next improvements

- Add `profile` page if missing for farmers
- Replace inline browser alerts with in-app notification banners
- Improve empty states on all list pages
- Add chart libraries for analytics and trends
- Add admin create-user and update-user forms
- Implement pagination for large lists
- Add better form validation across the frontend
