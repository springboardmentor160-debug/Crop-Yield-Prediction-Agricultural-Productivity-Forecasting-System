# YieldSense AI Frontend

This is the frontend application for the YieldSense AI agricultural forecasting platform.
It is built with Next.js 16, TypeScript, Tailwind CSS, and a client-side dashboard layout for Farmer, Analyst, and Admin roles.

## Project Overview

The frontend is designed to support:
- farmer dashboards and farm management
- AI yield prediction and soil analysis
- weather intelligence and risk assessment
- recommendations and reports
- analytics and visualizations
- role-based admin and analyst portals

## Architecture

### Directory structure

- `app/` — Next.js App Router pages and layouts
- `components/` — reusable UI components and layout shells
- `lib/` — API client, auth helpers, shared types
- `public/` — static assets

### Role-based layouts

- `frontend/app/(farmer)/layout.tsx` → Farmer dashboard shell
- `frontend/app/(admin)/layout.tsx` → Admin portal shell
- `frontend/app/(analyst)/layout.tsx` → Analyst portal shell

### Key shared modules

- `frontend/lib/api.ts` — centralized API request wrapper
- `frontend/lib/auth.ts` — token and user session helpers
- `frontend/lib/types.ts` — shared type definitions
- `frontend/components/layout/` — shell components for each role

## Available Pages

### Global / public pages
- `/` → login/register page
- `/auth` → authentication page

### Farmer pages
- `/dashboard` — live farmer dashboard
- `/farms` — farm CRUD and listing
- `/predict` — crop yield prediction UI
- `/weather` — weather intelligence dashboard
- `/soil` — soil analysis module
- `/recommendations` — recommendation engine
- `/risk` — risk assessment
- `/reports` — reports and CSV export
- `/analytics` — analytics dashboard
- `/advisor` — AI advisor chat
- `/alerts` — alerts center
- `/notifications` — notifications list
- `/map` — GIS / farm map

### Admin pages
- `/admin` — admin dashboard overview
- `/admin/users` — user management
- `/admin/farms` — farm management
- `/admin/models` — model monitoring and retrain
- `/admin/reports` — admin reports and exports
- `/admin/settings` — admin settings

### Analyst pages
- `/analyst` — analyst dashboard
- `/analyst/yield-trends` — yield trends
- `/analyst/crop-performance` — crop performance
- `/analyst/farm-comparison` — farm comparisons
- `/analyst/productivity` — productivity reports
- `/analyst/risk` — risk distribution and analytics
- `/analyst/weather` — weather impact analysis
- `/analyst/soil` — soil analytics
- `/analyst/reports` — analyst reporting
- `/analyst/dashboard` — analyst dashboard

## Environment

Create a file at `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
```

## Running Locally

Install dependencies and run the development server:

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## API Integration

The frontend uses `frontend/lib/api.ts` as the single request client.
It automatically attaches the JWT token from `localStorage` and calls backend endpoints under `/api/v1`.

### Authentication
- `POST /auth/register`
- `POST /auth/login`

### User
- `GET /users/me`
- `PUT /users/me`

### Farms
- `GET /farms/`
- `POST /farms/`
- `GET /farms/{farm_id}`
- `PUT /farms/{farm_id}`
- `DELETE /farms/{farm_id}`

### Predictions
- `POST /predictions/predict`
- `GET /predictions/history`
- `GET /predictions/farm/{farm_id}`
- `GET /predictions/model/metrics`
- `GET /predictions/crops/available`

### Weather
- `GET /weather/current`
- `GET /weather/forecast`
- `GET /weather/hourly`
- `GET /weather/history`
- `GET /weather/alerts`
- `GET /weather/risk`
- `GET /weather/advisory`
- `GET /weather/dashboard`

### Soil
- `POST /soil/analyze`
- `GET /soil/types`
- `GET /soil/fertility-guide`
- `POST /soil/crop-recommendation`
- `GET /soil/history`
- `GET /soil/history/{farm_id}`
- `GET /soil/health-score/{farm_id}`

### Recommendations
- `GET /recommendations/`
- `POST /recommendations/generate`
- `GET /recommendations/crop`
- `GET /recommendations/irrigation`
- `GET /recommendations/fertilizer`

### Risk
- `GET /risk/assessment`
- `GET /risk/disease`
- `GET /risk/profit`

### Reports
- `GET /reports/prediction-summary`
- `GET /reports/farm-report`
- `GET /reports/weather-report`
- `GET /reports/soil-report`
- `GET /reports/export/csv`

### Advisor
- `POST /advisor/chat`
- `GET /advisor/tasks`
- `GET /advisor/insights`
- `GET /advisor/calendar`

### Alerts
- `GET /alerts/`
- `PUT /alerts/read/{alert_id}`
- `PUT /alerts/read-all`
- `DELETE /alerts/{alert_id}`
- `GET /alerts/weather-alerts`

### Notifications
- `GET /notifications/`
- `GET /notifications/unread-count`
- `PUT /notifications/{notification_id}/read`
- `PUT /notifications/read-all`
- `DELETE /notifications/{notification_id}`

### Admin
- `GET /admin/users`
- `GET /admin/users/{id}`
- `POST /admin/users`
- `PUT /admin/users/{id}`
- `PUT /admin/users/{id}/role`
- `DELETE /admin/users/{id}`
- `GET /admin/farms`
- `GET /admin/farms/{id}`
- `PUT /admin/farms/{id}`
- `DELETE /admin/farms/{id}`
- `GET /admin/predictions`
- `GET /admin/predictions/{id}`
- `DELETE /admin/predictions/{id}`
- `GET /admin/dashboard`
- `GET /admin/stats`
- `GET /admin/reports`
- `GET /admin/reports/export/csv`
- `GET /admin/model`
- `GET /admin/system`
- `GET /admin/activity`

## Improvements and Next Steps

This frontend is already mostly implemented for farmer workflows. The next improvements are:

- connect Analyst pages to real analytics data
- finish Admin frontend management pages
- replace inline `alert()` usage with UI notifications
- add form validation and real empty-state handling
- create shared UI components for cards, buttons, and forms
- add route-level access protection for roles

## Deployment

Use standard Next.js deployment.
For a production build:

```bash
npm run build
npm run start
```

For Vercel, set `NEXT_PUBLIC_API_BASE` in the environment settings.

---

## Notes

If you want to make the app more lovable,
focus on these pages first:
- `app/dashboard/page.tsx`
- `app/predict/page.tsx`
- `app/weather/page.tsx`
- `app/soil/page.tsx`
- `app/recommendations/page.tsx`
- `app/risk/page.tsx`
- `app/reports/page.tsx`
- `app/analytics/page.tsx`
- `app/advisor/page.tsx`
- `app/gis/page.tsx`
- `app/notifications/page.tsx`
- `app/alerts/page.tsx`
- `app/analyst/page.tsx`
- `app/admin/page.tsx`
