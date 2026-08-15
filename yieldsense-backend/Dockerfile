FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pandas joblib scikit-learn python-dotenv requests

COPY docker_wheels/xgboost-3.3.0-py3-none-manylinux_2_28_x86_64.whl /tmp/

RUN pip install --no-cache-dir --no-deps /tmp/xgboost-3.3.0-py3-none-manylinux_2_28_x86_64.whl

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]