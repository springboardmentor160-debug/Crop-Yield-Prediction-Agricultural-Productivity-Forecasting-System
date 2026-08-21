# 🚀 YieldSense AI — Production Deployment Guide

> End-to-end production deployment guide for YieldSense AI (FastAPI Backend + Next.js Frontend + Firebase + ML Inference Engine).

---

## 📋 Architecture & Containerization Overview

YieldSense AI is containerized using multi-stage Docker builds and orchestrated locally via Docker Compose.

```
┌──────────────────────────────────────────────────────────┐
│                   Docker Network                         │
│                                                          │
│   ┌──────────────────────┐    ┌──────────────────────┐   │
│   │  frontend container  │───▶│   backend container  │   │
│   │     Next.js 16       │    │     FastAPI 0.115    │   │
│   │     Port: 3000       │    │     Port: 8000       │   │
│   └──────────────────────┘    └──────────────────────┘   │
└──────────────────────────┬───────────────────────────────┘
                           │
                 ┌─────────┴─────────┐
                 │  Firebase Cloud   │
                 │  Auth & Firestore │
                 └───────────────────┘
```

---

## 🛠️ Local Docker Setup & Verification

### 1. Build and Run Container Suite

```bash
docker compose up --build -d
```

### 2. Verify Container Health

```bash
# Check container status
docker compose ps

# Check backend health endpoint
curl http://localhost:8000/api/v1/health

# View container logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 3. Stop Containers

```bash
docker compose down
```

---

## 🔑 Environment Variables Setup

Ensure production secrets are never committed to version control. Copy `.env.example` templates to `.env`:

### Backend `.env`

```env
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_WEB_API_KEY=your-web-api-key
CORS_ORIGINS=https://your-frontend-domain.com
API_V1_PREFIX=/api/v1
DEBUG=false
PORT=8000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
```

---

## 🌐 Public Cloud Deployment Options

### Option A: Render (Free Tier Compatible)

#### 1. Deploy Backend Web Service
- Connect your GitHub Repository to Render.
- Root Directory: `backend`
- Environment: `Python 3` (or `Docker`)
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set Environment Variables: `FIREBASE_PROJECT_ID`, `CORS_ORIGINS`, etc.
- Health Check Path: `/api/v1/health`

#### 2. Deploy Frontend Web Service
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm start`
- Set Environment Variable: `NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api/v1`

---

### Option B: Railway / Vercel

- **Frontend**: Deploy `frontend/` to **Vercel** (`vercel deploy`). Vercel natively supports Next.js App Router and standalone output.
- **Backend**: Deploy `backend/` to **Railway** or **Render**. Set `CORS_ORIGINS` to the Vercel frontend URL.

---

### Option C: AWS / Docker Container Deployment

#### 1. Build and Tag Images
```bash
docker build -t yieldsense-backend:latest ./backend
docker build -t yieldsense-frontend:latest ./frontend
```

#### 2. Push to ECR / Docker Hub
```bash
docker tag yieldsense-backend:latest <your-account-id>.dkr.ecr.<region>.amazonaws.com/yieldsense-backend:latest
docker push <your-account-id>.dkr.ecr.<region>.amazonaws.com/yieldsense-backend:latest
```

#### 3. Deploy to AWS App Runner / ECS
- Point AWS App Runner service to ECR image.
- Set environment variables in the AWS console.

---

## 🛡️ Production Security Checklist

- [x] No `serviceAccountKey.json` or real `.env` files committed to Git.
- [x] CORS restricted to official frontend domain in production (`CORS_ORIGINS`).
- [x] Non-root user inside production Docker container (`nextjs:nodejs`).
- [x] Multi-stage standalone build optimizations for Next.js and Python slim image.
- [x] Healthcheck endpoint `/api/v1/health` enabled.
- [x] HTTPS enforced on cloud provider endpoints.

---

## 🧪 Production Verification Flow

1. Open deployed frontend URL.
2. Sign up / Log in with test user credentials.
3. Access Farm Management (`/farms`) and create a farm.
4. Run Yield Prediction (`/prediction`) with real crop and weather data.
5. View generated Analytics (`/analytics`).
6. Inspect Farm Advisory recommendations & risk levels (`/farms/[id]`).
7. Generate and download PDF / CSV reports (`/reports`).
