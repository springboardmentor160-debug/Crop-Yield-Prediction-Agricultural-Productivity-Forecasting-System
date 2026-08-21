FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check (uses PORT env if present, defaults to 8000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/v1/health || exit 1

# Run model check/train if missing, then start application binding to ${PORT:-8000} for Render compatibility
CMD ["sh", "-c", "if [ ! -f /app/ml/models/saved/yield_best_model.joblib ]; then python -m ml.train; fi && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
