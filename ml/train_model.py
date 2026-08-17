import sys
import os

# Ensure backend path is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from train_model import train_yield_engine

if __name__ == "__main__":
    data_path = os.path.join(backend_path, "data", "processed", "crop_yield_clean.csv")
    model_path = os.path.join(backend_path, "data", "processed", "crop_yield_model.pkl")
    metrics_path = os.path.join(backend_path, "data", "processed", "model_metrics.json")
    train_yield_engine(data_path=data_path, model_export_path=model_path, metrics_export_path=metrics_path)
