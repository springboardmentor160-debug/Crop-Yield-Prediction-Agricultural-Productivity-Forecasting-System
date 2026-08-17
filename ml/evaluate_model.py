import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from evaluate_model import evaluate_model

if __name__ == "__main__":
    os.chdir(backend_path)
    evaluate_model()
