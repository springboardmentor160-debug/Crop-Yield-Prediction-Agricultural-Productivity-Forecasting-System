@echo off
echo ===================================================
echo Starting YieldSense AI Platform Servers...
echo ===================================================

:: 1. Start Backend FastAPI Server
echo Launching Backend FastAPI services...
if "%JWT_SECRET_KEY%"=="" (
  echo [ERROR] Set JWT_SECRET_KEY before running this script.
  echo Example: set JWT_SECRET_KEY=replace-with-a-long-random-secret
  pause
  exit /b 1
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo [ERROR] Backend virtual environment is missing. Run the setup instructions in README.md.
  pause
  exit /b 1
)
start cmd /k "cd backend && .venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000"
echo [OK] Backend script executed. Serving at http://127.0.0.1:8000.

:: 2. Start Frontend Next.js Dev Server
echo Launching Frontend Next.js client...
start cmd /k "cd frontend && npm run dev"
echo [OK] Frontend script executed. Serving at http://localhost:3000.

echo ===================================================
echo Both servers are launching in separate windows!
echo - Backend API: http://127.0.0.1:8000/api/v1/health
echo - Frontend App: http://localhost:3000
echo ===================================================
pause
