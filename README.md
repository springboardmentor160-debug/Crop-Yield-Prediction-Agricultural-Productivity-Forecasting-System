# 🌾 YieldSense AI

**A smart tool that helps farmers predict how much of their crop they'll harvest — before the season even ends.**

---

## What is this?

Imagine you're a farmer, and every season you're guessing: *"How much wheat will I actually get this year? Should I buy more fertilizer? Is the weather going to hurt my harvest?"*

YieldSense AI takes the guesswork out of that. You tell it about your farm — its location, soil, and the crop you're growing — and it looks at historical farming data, weather patterns, and soil quality to give you a **prediction of how much you'll harvest**, along with practical advice on what to do about it.

It's built for:
- 🧑‍🌾 **Individual farmers** managing their own land
- 🤝 **Agricultural cooperatives** and farming groups
- 🏢 **Agribusiness companies**
- 🏛️ **Government agriculture departments**

---

## What can it actually do?

| Feature | What it means in plain terms |
|---|---|
| **Farm Management** | Add your farms to the system — location, size, soil type — so the app knows what it's working with. |
| **Yield Prediction** | Get an estimate of how much crop you'll harvest, powered by an AI model trained on real farming data. |
| **Weather Analysis** | See rainfall, temperature, and climate trends that could affect your crop. |
| **Soil Analysis** | Check your soil's health — nutrients, fertility, pH — and find out which crops suit it best. |
| **Recommendations** | Get plain-language advice: what to plant, how to use resources better, and how to avoid risks. |
| **Analytics Dashboard** | See how your farm is doing over time and compare it with previous seasons. |
| **Accounts & Roles** | Farmers, analysts, and admins each get a version of the app suited to what they need to do. |

---

## Who sees what? (User Roles)

The app isn't "one size fits all" — different people get different tools:

- **👨‍🌾 Farmer** — Manage your own farms, run predictions, and view weather/soil insights and recommendations for your land.
- **📊 Analyst** — Look at data across many farms, fine-tune the prediction models, and generate reports.
- **🛠️ Admin** — Manage user accounts, oversee the whole system, and configure platform settings.

---

## How it works, in simple terms

1. **You add your farm** — its location, size, and soil details.
2. **You add crop info** — what you're planting and when.
3. **The system pulls in weather and soil data** relevant to your farm.
4. **The AI model crunches the numbers** — comparing your farm's data against patterns learned from thousands of historical records — and produces a yield estimate.
5. **You get a report**: predicted yield, risk level (low/medium/high), and recommendations on what to do next.

Behind the scenes, this involves a website (what you interact with), a server (that processes your requests), a database (that stores your data), and a trained AI model (that makes the prediction) — but as a user, all you see is a clean dashboard with your answer.

---

## What powers it (for the curious)

You don't need to understand this to use the app, but if you're curious what's "under the hood":

- **What you see (Frontend):** A modern website built with Next.js, styled to look clean and professional, with charts and graphs to visualize your data.
- **What processes it (Backend):** A Python-based server that handles logins, stores your farm data, and talks to the AI model.
- **Where data lives (Database):** PostgreSQL (structured data like farms and users) and optionally MongoDB (for flexible, less structured data).
- **The brains (AI/ML):** Machine learning models (like XGBoost) trained on real agricultural datasets from sources like FAOSTAT (UN), USDA, and Kaggle.
- **How it's deployed:** Packaged with Docker so it can run consistently anywhere, and hosted on cloud platforms like AWS or Azure.

---

## Getting Started (for developers)

If you want to run this project on your own computer:

### You'll need
- Node.js 18+
- Python 3.10+
- PostgreSQL (installed locally, or via Docker)

### 1. Start the website (frontend)
```bash
cd frontend
npm install
npm run dev
```
Then open `http://localhost:3000` in your browser.

### 2. Start the server (backend)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
The server runs at `http://127.0.0.1:8000/api/v1`, with interactive API docs at `http://127.0.0.1:8000/docs`.

### 3. Set up the database
```bash
psql -U postgres
CREATE DATABASE yieldsense_db;
CREATE USER yieldsense WITH PASSWORD 'yieldsense_dev_pw';
GRANT ALL PRIVILEGES ON DATABASE yieldsense_db TO yieldsense;
\q

psql -U yieldsense -d yieldsense_db -f schema.sql
```
(Or use Docker Compose — see the `backend/docker/` folder.)

### 4. Add your settings

`backend/.env`:
```
DATABASE_URL=postgresql://yieldsense:yieldsense_dev_pw@localhost:5432/yieldsense_db
SECRET_KEY=your-secret-key-here
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
```

### 5. Load in the farming data
```bash
cd backend
# place your Kaggle CSV files in data/raw/ first
python preprocess.py
```

---

## Project layout (where to find things)

```
yieldsense-ai/
├── docs/            → all the written project documentation
├── frontend/        → the website users interact with
├── backend/         → the server, database logic, and AI model code
├── schema.sql       → the database blueprint
└── README.md        → you are here
```

---

## What's done, and what's next

**✅ Already built**
- User accounts with role-based access (Farmer / Analyst / Admin)
- Farm management (add, view, delete farms)

**🚧 Still on the roadmap**
- Full PostgreSQL migration
- Editing existing farm records
- The yield prediction module (backend + frontend)
- Weather analysis module
- Soil analysis module
- Recommendations engine
- Admin tools for managing users
- Analytics/reporting dashboard
- Verified data pipeline
- Docker & cloud deployment

---

## Where the data comes from

The AI model is trained using public, trustworthy agricultural datasets:
- **FAOSTAT** (UN Food and Agriculture Organization) — global crop production stats
- **USDA** — U.S. crop yield and farming data
- **Kaggle** — crop yield and crop recommendation datasets
- **Weather APIs** — live and historical weather data

---

## Questions?

Check the full documentation in the `docs/` folder for deep-dive details on architecture, database design, and the forecasting workflow.