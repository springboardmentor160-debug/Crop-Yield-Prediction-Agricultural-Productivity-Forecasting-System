# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first so Docker can cache this layer — code changes
# won't force a full reinstall of every package.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# 0.0.0.0, not localhost/127.0.0.1 — required for the container to accept
# connections from outside itself.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
