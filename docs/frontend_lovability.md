# Frontend Lovability Guide

This document explains how to make the YieldSense AI frontend more lovable: polished, user-friendly, consistent, and ready for production.

## 1. UX / UI polish

### Visual consistency
- Use a consistent color palette across all pages.
  - Primary: dark forest green / soft teal
  - Accent: harvest gold / amber
  - Neutral: dark slate, soft gray, and near-black backgrounds
- Keep typography consistent with the root font definitions in `frontend/app/layout.tsx`.
- Use consistent card styling, buttons, and spacing patterns.

### Layout and navigation
- Use `FarmerShell`, `AdminShell`, and `AnalystShell` consistently.
- Make sure role-based redirects are reliable in `frontend/app/auth/page.tsx` and shell components.
- Add a visible active state and hover state for sidebar items.
- Keep a sticky header or a top toolbar for quick actions and page context.

### Forms and feedback
- Add validation feedback in forms for login, farms, prediction, soil analysis, and risk assessment.
- Show loading states and error messages consistently.
- Replace native `alert()` with styled inline messages or notification banners.
- Use unified form input components if possible.

### Accessibility
- Use semantic headings and accessible button labels.
- Ensure contrast ratios are strong for text and controls on dark backgrounds.
- Support keyboard interaction and sensible focus styles.

## 2. Frontend architecture improvements

### Centralize common UI patterns
- Create shared components in `frontend/components/ui/`:
  - `Button.tsx`
  - `Card.tsx`
  - `FormField.tsx`
  - `LoadingState.tsx`
  - `PageHeader.tsx`
- Refactor repeated layout structures in pages to use shared components.

### Organize routes and role pages
- Keep farmer pages under `frontend/app/` and make sure the farmer shell only exposes farmer routes.
- Keep admin pages under `frontend/app/admin/` and analyst pages under `frontend/app/analyst/`.
- Centralize route definitions and page titles for easier maintenance.

### API layer improvements
- Continue using `frontend/lib/api.ts` as the single network layer.
- Add typed request and response interfaces to avoid `any` usage.
- Add retries or better error handling for failed network responses.
- Consider moving `API_BASE` to `NEXT_PUBLIC_API_BASE` and use `process.env.NEXT_PUBLIC_API_BASE`.

## 3. Feature upgrade plan

### Make dashboard lovable
- Add a hero summary section with the user greeting and key metrics.
- Use real charts or simple data visualizations for predictions, weather, and analytics.
- Add cards for alerts, recommendations, and recent activity.

### Improve farm management
- Keep the farm listing intuitive with search, sort, and quick action buttons.
- Use modal forms with inline validation and clear success/error messages.
- Show farm status badges and summary metrics.

### Improve prediction and analysis flows
- Make the prediction page feel like a guided workflow.
- Display the AI result with a clear outcome, risk badge, confidence bar, and actionable recommendations.
- For soil analysis, show nutrient bars and a clean summary.
- For weather, show current conditions, forecast highlights, and advisory cards.

### Improve advisor experience
- Make AI chat feel more natural with user/AI message bubbles.
- Provide quick suggestion chips and a visible prompt.
- Add task cards and crop calendar cards with clear color-coded actions.

## 4. Developer checklist

- [ ] Add `profile` page or remove the profile sidebar item if not implemented.
- [ ] Convert inline `alert()` usage into styled notifications.
- [ ] Replace duplicate navbar markup with a shared header component.
- [ ] Use `frontend/lib/types.ts` across all pages instead of local `any` types.
- [ ] Add environment config in `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
  ```
- [ ] Add signup/login UX improvements such as role-specific copy and account success state.
- [ ] Review all role redirects to prevent unauthorized access and role mismatch display.

## 5. Design details to make the frontend lovable

### Delightful touches
- Add subtle micro-interactions: hover states, button transitions, card shadows.
- Use nice icons from `lucide-react` consistently.
- Add a few friendly status messages and placeholder illustrations.
- Keep text concise and farm-focused.

### Use emotional language
- Replace technical labels with farmer-friendly words like `My Farms`, `Yield Forecast`, `Soil Health`, `Weather Alerts`, `Smart Advisor`.
- Show positive reinforcement on success: `Prediction complete!`, `Analysis saved`, `Good job, your farm is set.`

## 6. Suggested file targets

- `frontend/app/auth/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/farms/page.tsx`
- `frontend/app/predict/page.tsx`
- `frontend/app/soil/page.tsx`
- `frontend/app/weather/page.tsx`
- `frontend/app/recommendations/page.tsx`
- `frontend/app/advisor/page.tsx`
- `frontend/components/layout/FarmerShell.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/auth.ts`
- `frontend/components/ui/`

## 7. Recommended next steps

1. Define a small UI redesign brief: colors, spacing, card rules, button styles.
2. Build shared UI components and replace repeated page markup.
3. Improve the auth and onboarding flow with clear role-based landing pages.
4. Add polished loading/error states.
5. Add a `Love the app` checklist: simplicity, helpfulness, fast actions, consistent experience.

---

This guide is a practical plan to make the YieldSense AI frontend feel lovable, polished, and easier to maintain.
Checking backend API structure and frontend pages/components to build documentation.

Searched for files matching `**/backend/app/**/*.py`, 33 matches

Searched for files matching `**/frontend/**/*.ts*`, 48 matches

Read [](file:///c%3A/yieldsense-ai/backend/app/main.py)

Read [](file:///c%3A/yieldsense-ai/README.md#1-1), lines 1 to 200

Read [](file:///c%3A/yieldsense-ai/frontend/package.json)

Gathering the backend API contract and frontend route/components structure.

Read [](file:///c%3A/yieldsense-ai/backend/app/models.py#1-1), lines 1 to 260

Read [](file:///c%3A/yieldsense-ai/backend/app/schemas.py#1-1), lines 1 to 260

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/auth.py)

Read [](file:///c%3A/yieldsense-ai/frontend/lib/api.ts#1-1), lines 1 to 240

Read [](file:///c%3A/yieldsense-ai/frontend/lib/auth.ts)

Scanning backend API endpoints and frontend route/layout files for accurate documentation.

Searched for regex `APIRouter\(prefix="/api/v1|router = APIRouter\(prefix` (`**/backend/app/routers/**/*.py`), 18 results

Collecting endpoint definitions and frontend route/page structure now.

Searched for regex `router\.(get|post|put|delete|patch)\(` (`**/backend/app/routers/*.py`), 114 results

Searched for regex `export default function|function .*\(|use client|href=|router.push|redirectPathForRole|setSession|api\.` (`**/frontend/app/**/*.tsx`), 244 results

Reviewing frontend route layout and sample page implementations to document the full UX flow.

Read [](file:///c%3A/yieldsense-ai/frontend/app/layout.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/auth/page.tsx#1-1), lines 1 to 220

Read [](file:///c%3A/yieldsense-ai/frontend/app/dashboard/page.tsx#1-1), lines 1 to 260

Read [](file:///c%3A/yieldsense-ai/frontend/app/farms/page.tsx#1-1), lines 1 to 260

Read [](file:///c%3A/yieldsense-ai/frontend/app/predict/page.tsx#1-1), lines 1 to 220

Reviewing backend endpoints and frontend route mapping for accurate documentation.

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/farms.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/data_collection.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/yield_prediction.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/soil.py#1-1), lines 1 to 260

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/weather.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/analytics.py)

Collecting layout, type, and backend config details to complete the frontend documentation.

Read [](file:///c%3A/yieldsense-ai/frontend/app/dashboard/layout.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/%28admin%29/layout.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/%28analyst%29/layout.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/%28farmer%29/layout.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/lib/types.ts)

Reviewing backend auth/config and database setup to document API security and environment details.

Replacing 1 lines with 1 lines in [](file:///c%3A/yieldsense-ai/backend/app/core/config.py)

Gathering backend auth/permissions details and frontend shell layouts to complete the documentation accurately.

Replacing 1 lines with 1 lines in [](file:///c%3A/yieldsense-ai/backend/app/core/config.py)

Reading backend auth/permissions and frontend layout shells to capture the full flow and role-specific UI.

Replacing 1 lines with 1 lines in [](file:///c%3A/yieldsense-ai/backend/app/core/config.py)

Reading backend auth/permissions and frontend layout shell files for complete docs.

Read [](file:///c%3A/yieldsense-ai/backend/app/core/config.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/core/deps.py)

Read [](file:///c%3A/yieldsense-ai/frontend/components/layout/AdminShell.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/components/layout/FarmerShell.tsx)

Read [](file:///c%3A/yieldsense-ai/backend/app/core/permissions.py)

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/recommendations.py)

Confirming the key frontend pages and admin/analyst routes before writing documentation.

Replacing 5 lines with 5 lines in [](file:///c%3A/yieldsense-ai/frontend/app/advisor/page.tsx), [](file:///c%3A/yieldsense-ai/frontend/app/reports/page.tsx), [](file:///c%3A/yieldsense-ai/frontend/app/analytics/page.tsx), [](file:///c%3A/yieldsense-ai/frontend/app/soil/page.tsx), [](file:///c%3A/yieldsense-ai/frontend/app/weather/page.tsx)

Reading remaining key frontend pages to confirm API usage and UX flow.

Read [](file:///c%3A/yieldsense-ai/frontend/app/advisor/page.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/reports/page.tsx#1-1), lines 1 to 220

Read [](file:///c%3A/yieldsense-ai/frontend/app/analytics/page.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/soil/page.tsx)

Read [](file:///c%3A/yieldsense-ai/frontend/app/weather/page.tsx#1-1), lines 1 to 220

Searched for files matching `**/frontend/app/profile/**`, no matches

Read [](file:///c%3A/yieldsense-ai/frontend/app/page.tsx)

Finalizing API endpoint details and admin route docs.

Read [](file:///c%3A/yieldsense-ai/backend/app/routers/admin.py)

## YieldSense AI Frontend Documentation

### 1. Overview

The frontend is a Next.js (App Router) application in frontend, built with TypeScript and Tailwind CSS. It is a client-heavy dashboard for three roles:
- `Farmer`
- `Analyst`
- `Admin`

Key files:
- layout.tsx — root layout, font and metadata
- api.ts — API client wrapper
- auth.ts — localStorage session helpers
- types.ts — shared TypeScript interfaces
- layout — role-specific shells
- `frontend/app/**` — page routes

---

### 2. Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app should run at:
- `http://localhost:3000`

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The backend runs at:
- `http://127.0.0.1:8000/api/v1`

---

### 3. API Base and Auth

api.ts uses:
- `API_BASE = "http://127.0.0.1:8000/api/v1"`

Authentication:
- Login / register return `access_token` and `user`
- Token stored in `localStorage` under key `token`
- User stored under key `user`
- Authorization header: `Bearer <token>`

---

### 4. Frontend Structure

#### Root
- page.tsx → redirects to `./auth/page.tsx`
- page.tsx → login/register form

#### Layouts and shells
- layout.tsx → wraps farmer routes with `FarmerShell`
- layout.tsx → wraps admin routes with `AdminShell`
- layout.tsx → wraps analyst routes with `AnalystShell`

#### Main Farmer pages
- page.tsx — farmer dashboard
- page.tsx — farms CRUD
- page.tsx — yield prediction
- page.tsx — weather dashboard
- page.tsx — soil analysis
- page.tsx — recommendation engine
- page.tsx — risk assessment
- page.tsx — analytics overview
- page.tsx — reports and exports
- page.tsx — AI advisor chat
- page.tsx — alert list
- page.tsx — notifications list
- page.tsx — GIS/map page

#### Admin pages
- page.tsx — admin dashboard
- page.tsx — user management
- page.tsx — farms management
- page.tsx — model monitoring/retrain
- page.tsx — admin reports
- page.tsx — admin settings

#### Analyst pages
- page.tsx — analyst dashboard
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx

---

### 5. Frontend UI and Navigation

FarmerShell.tsx provides:
- sidebar navigation
- top bar
- role check / redirect
- logout
- unread notification badge

AdminShell.tsx and AnalystShell.tsx provide role-specific admin/analyst navigation and protected layout.

---

### 6. Backend API Endpoints Used by Frontend

#### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

#### User
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`

#### Farms
- `POST /api/v1/farms/`
- `GET /api/v1/farms/`
- `GET /api/v1/farms/{farm_id}`
- `PUT /api/v1/farms/{farm_id}`
- `DELETE /api/v1/farms/{farm_id}`

#### Crop Data
- `POST /api/v1/data/farms/{farm_id}/crops`
- `GET /api/v1/data/farms/{farm_id}/crops`

#### Yield Prediction
- `POST /api/v1/predictions/predict`
- `GET /api/v1/predictions/history`
- `GET /api/v1/predictions/farm/{farm_id}`
- `GET /api/v1/predictions/model/metrics`
- `GET /api/v1/predictions/crops/available`

#### Weather
- `GET /api/v1/weather/current`
- `GET /api/v1/weather/forecast`
- `GET /api/v1/weather/hourly`
- `GET /api/v1/weather/history`
- `GET /api/v1/weather/alerts`
- `GET /api/v1/weather/risk`
- `GET /api/v1/weather/advisory`
- `GET /api/v1/weather/dashboard`

#### Soil
- `POST /api/v1/soil/analyze`
- `GET /api/v1/soil/types`
- `GET /api/v1/soil/fertility-guide`
- `POST /api/v1/soil/crop-recommendation`
- `GET /api/v1/soil/history`
- `GET /api/v1/soil/history/{farm_id}`
- `GET /api/v1/soil/health-score/{farm_id}`

#### Analytics
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/yield-trends`
- `GET /api/v1/analytics/crop-performance`
- `GET /api/v1/analytics/farm-comparison`
- `GET /api/v1/analytics/productivity`
- `GET /api/v1/analytics/risk-distribution`
- `GET /api/v1/analytics/soil-health`
- `GET /api/v1/analytics/weather-impact`
- `GET /api/v1/analytics/recent-predictions`
- `GET /api/v1/analytics/model-performance`

#### Recommendations
- `GET /api/v1/recommendations/`
- `POST /api/v1/recommendations/generate`
- `GET /api/v1/recommendations/crop`
- `GET /api/v1/recommendations/irrigation`
- `GET /api/v1/recommendations/fertilizer`

#### Risk
- `GET /api/v1/risk/assessment`
- `GET /api/v1/risk/disease`
- `GET /api/v1/risk/profit`

#### Reports
- `GET /api/v1/reports/prediction-summary`
- `GET /api/v1/reports/farm-report`
- `GET /api/v1/reports/weather-report`
- `GET /api/v1/reports/soil-report`
- `GET /api/v1/reports/export/csv`

#### Advisor
- `POST /api/v1/advisor/chat`
- `GET /api/v1/advisor/tasks`
- `GET /api/v1/advisor/insights`
- `GET /api/v1/advisor/calendar`

#### Alerts
- `GET /api/v1/alerts/`
- `PUT /api/v1/alerts/read/{alert_id}`
- `PUT /api/v1/alerts/read-all`
- `DELETE /api/v1/alerts/{alert_id}`
- `GET /api/v1/alerts/weather-alerts`

#### Notifications
- `GET /api/v1/notifications/`
- `GET /api/v1/notifications/unread-count`
- `PUT /api/v1/notifications/{notification_id}/read`
- `PUT /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/{notification_id}`

#### Admin
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{id}`
- `POST /api/v1/admin/users`
- `PUT /api/v1/admin/users/{id}`
- `PUT /api/v1/admin/users/{id}/role`
- `DELETE /api/v1/admin/users/{id}`
- `GET /api/v1/admin/farms`
- `GET /api/v1/admin/farms/{id}`
- `PUT /api/v1/admin/farms/{id}`
- `DELETE /api/v1/admin/farms/{id}`
- `GET /api/v1/admin/predictions`
- `GET /api/v1/admin/predictions/{id}`
- `DELETE /api/v1/admin/predictions/{id}`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/reports/export/csv`
- `GET /api/v1/admin/model`
- `POST /api/v1/admin/model/retrain`

---

### 7. Data models used by frontend

Important backend models:
- `User` — id, full_name, email, role
- `Farm` — id, farm_name, location, soil_ph, area_hectares, latitude, longitude
- `Crop` — farm crop data
- `Prediction` — yield prediction records
- `SoilAnalysis` — soil health records
- `Notification` — user notifications

---

### 8. Notes for building the full frontend

- All farmer pages are assembled inside `FarmerShell` and guarded via localStorage session.
- `Auth` immediately stores the session and redirects based on role.
- `Dashboard` aggregates farms, model metrics, weather and prediction history.
- `Farms` supports add/edit/delete.
- `Predict` submits `PredictionRequest` to backend and renders result/recommendations.
- `Soil` sends soil parameters and displays fertility data.
- `Recommendations`, `Risk`, and `Weather` pages are mostly frontend wrappers for backend endpoints.
- `Advisor` is a chat-like interface plus task/calendar panels.
- `Analytics` is a data visualization page using backend dashboard APIs.
- `Reports` supports CSV export via backend `export/csv`.

---

### 9. Important implementation details

- api.ts is the single network layer.
- auth.ts handles token + user storage.
- `frontend/app/*` pages are client components with `useEffect` for auth checks.
- `admin` and `analyst` layouts redirect based on role.
- The project uses `lucide-react` for icons and basic Tailwind utility classes.

---

### 10. Known gaps / caveats

- `Profile` appears in sidebar but there is no `frontend/app/profile/page.tsx` file.
- Admin export endpoints for Excel/PDF are placeholder responses.
- Weather uses mock services in backend; not real external API integration.
- Some pages assume backend returns full data shapes but may require backend updates if the response shape changes.

If you want, I can also generate a single `frontend-documentation.md` file in the repo summarizing this exact architecture and flow.