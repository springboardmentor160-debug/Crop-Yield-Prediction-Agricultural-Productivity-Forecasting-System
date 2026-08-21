# Backend Setup

This backend uses a local virtual environment and FastAPI.

## Setup

1. Open a terminal in `backend/`
2. Activate the virtual environment:
   - PowerShell: `venv\Scripts\Activate.ps1`
   - Windows CMD: `venv\Scripts\activate.bat`
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

## Run

```powershell
uvicorn app.main:app --reload
```

## Notes

- If you see `ModuleNotFoundError: No module named 'fastapi'`, make sure the `backend/venv` interpreter is active.
- The `app/` directory is a package entrypoint for the backend application.
