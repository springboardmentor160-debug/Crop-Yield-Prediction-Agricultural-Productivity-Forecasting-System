# YieldSense AI

AI-powered crop yield prediction and agricultural productivity forecasting platform. YieldSense AI helps farmers, agricultural cooperatives, agribusinesses, and government agriculture departments estimate future crop production using historical farming data, weather conditions, and soil characteristics.

## Overview

The platform supports crop yield forecasting, weather analysis, soil analysis, productivity prediction, and agricultural analytics through a centralized, role-based dashboard. It's designed to improve farming decisions, optimize resource use, reduce uncertainty, and increase agricultural productivity through data-driven insights.

## Features

- **Authentication & role-based access control** — Farmer, Analyst, and Admin roles with distinct dashboards
- **Farm management** — add, view, and manage farm records (location, area, soil pH, coordinates)
- **Crop data collection** — track crop type, planting dates, and historical records per farm
- **Yield prediction** — AI model inference for crop yield forecasting and harvest estimation
- **Weather analysis** — rainfall, temperature, and climate trend monitoring
- **Soil analysis** — soil quality, nutrient, and fertility assessment with crop suitability recommendations
- **Recommendations engine** — crop planning suggestions, resource optimization advice, risk mitigation guidance
- **Analytics dashboard** — seasonal performance and farm comparison reporting

## Tech Stack

**Frontend**
- Next.js (React), TypeScript, Tailwind CSS
- lucide-react (icons)
- Recharts / Chart.js (data visualization)

**Backend**
- Python (FastAPI)
- JWT authentication

**Database**
- PostgreSQL (primary relational store)
- MongoDB (optional, operational/unstructured data)

**AI / Machine Learning**
- Scikit-learn, TensorFlow, XGBoost, Pandas, NumPy

**Data Sources**
- FAOSTAT Crop Production Dataset
- USDA Agricultural Data
- Kaggle Crop Yield Prediction Dataset
- Kaggle Crop Recommendation Dataset
- Weather APIs

**DevOps**
- Docker, Docker Compose
- AWS / Azure
- Git + GitHub, Postman

## Project Structure

```
yieldsense-ai/
├── docs/
│   ├── project_requirements.md    # objective, outcomes, modules, milestones
│   ├── architecture.md             # layered system architecture
│   ├── workflow.md                 # end-to-end forecasting pipeline
│   ├── database_schema.md          # PostgreSQL schema documentation
│   ├── ui_wireframes.md            # auth / farm onboarding / dashboard shell
│   ├── datasets.md                 # dataset sources + reference repos
│   └── MILESTONE_1_CHECKLIST.md    # milestone 1 sign-off checklist
│
├── schema.sql                       # executable PostgreSQL schema
│
├── frontend/
│   ├── app/
│   │   ├── globals.css              # design tokens (colors, fonts)
│   │   ├── layout.tsx                # root layout, font loading
│   │   ├── page.tsx                  # auth (login / register)
│   │   └── dashboard/page.tsx        # role-based dashboard
│   ├── components/
│   │   └── dashboard/                # stat cards, action cards, role dashboards
│   ├── lib/
│   │   └── api.ts                    # API client
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry + health check
│   │   ├── models.py                 # SQLAlchemy models
│   │   ├── schemas.py                 # request/response schemas
│   │   ├── database.py                # DB connection setup
│   │   ├── core/
│   │   │   ├── config.py              # settings / env vars
│   │   │   ├── security.py            # JWT auth, password hashing
│   │   │   ├── deps.py                # auth dependencies, RBAC
│   │   │   └── notify.py              # notification logic
│   │   └── routers/                   # API route handlers
│   ├── ai/                            # ML model training/inference code
│   ├── data/
│   │   ├── raw/                       # downloaded Kaggle CSVs (gitignored)
│   │   └── processed/                 # cleaned output of preprocess.py
│   ├── preprocess.py                  # data cleaning pipeline
│   ├── requirements.txt
│   ├── .env.example
│   └── docker/
│
└── README.md
```

## Design System

- **Palette:** deep forest green (primary), harvest gold, soil brown, sky blue — flat surfaces, no gradients
- **Typography:** Space Grotesk (headings), Inter (body), IBM Plex Mono (stat figures)
- **Cards:** quiet left-border accents instead of full pastel fills

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (locally or via Docker)

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000/api/v1`. Swagger docs at `http://127.0.0.1:8000/docs`.

### Database setup

```bash
psql -U postgres
CREATE DATABASE yieldsense_db;
CREATE USER yieldsense WITH PASSWORD 'yieldsense_dev_pw';
GRANT ALL PRIVILEGES ON DATABASE yieldsense_db TO yieldsense;
\q

psql -U yieldsense -d yieldsense_db -f schema.sql
```

Or via Docker Compose (see `backend/docker/`).

### Environment variables

`backend/.env`:
```
DATABASE_URL=postgresql://yieldsense:yieldsense_dev_pw@localhost:5432/yieldsense_db
SECRET_KEY=your-secret-key-here
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
```

### Data pipeline

```bash
cd backend
# place Kaggle CSVs in data/raw/ first
python preprocess.py
```

Output lands in `data/processed/`.

## User Roles

| Role | Access |
|---|---|
| **Farmer** | Manage own farms, run yield predictions, view weather/soil analysis and recommendations |
| **Analyst** | View aggregated data, run/tune prediction models, generate reports |
| **Admin** | Manage users and roles, view system-wide analytics, configure platform settings |

## Documentation

Full project documentation lives in [`docs/`](./docs):
- [Project Requirements](./docs/project_requirements.md)
- [Architecture](./docs/architecture.md)
- [Workflow](./docs/workflow.md)
- [Database Schema](./docs/database_schema.md)
- [UI Wireframes](./docs/ui_wireframes.md)
- [Datasets](./docs/datasets.md)
- [Milestone 1 Checklist](./docs/MILESTONE_1_CHECKLIST.md)

## Roadmap

- [x] Authentication & role-based dashboards
- [x] Farm management (create, list, delete)
- [ ] PostgreSQL migration (from SQLite)
- [ ] Farm edit/update flow
- [ ] Yield prediction module (backend + frontend)
- [ ] Weather analysis module
- [ ] Soil analysis module
- [ ] Recommendations engine
- [ ] Admin user management
- [ ] Analytics/reporting dashboard
- [ ] Data preprocessing pipeline run + verified output
- [ ] Docker deployment
- [ ] Cloud deployment (AWS/Azure)



