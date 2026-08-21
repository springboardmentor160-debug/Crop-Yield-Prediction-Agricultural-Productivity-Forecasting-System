# Testing Strategy

YieldSense AI employs a robust automated testing strategy to guarantee the stability of its backend API, Machine Learning inference layers, and Database persistence, preventing silent fabrication of data or authorization breaches.

## Backend Pytest Suite

The Pytest suite (`backend/tests/`) ensures functional correctness across API components and ML models.

### API Integration Tests (`test_api.py`)
- **Authentication & Authorization**: Tests JWT issuance, duplicate registration rejection (409 Conflict), and invalid login handling (401 Unauthorized). Ensures users cannot execute analysis pipelines on farms they do not own (403 Forbidden cross-tenant isolation).
- **CRUD Operations**: Validates correct creation of Farm and Crop resources and proper handling of authorization headers.
- **Analysis Workflow**: Performs an end-to-end execution of the unified analysis endpoint. Validates that the endpoint correctly fetches external weather, constructs feature vectors, and returns predictions for yield, recommendation, and weather states.
- **History Retrieval**: Validates that historical analyses (yield predictions, recommendations, and weather observations) are successfully persisted into PostgreSQL and can be correctly fetched via the API.

### ML Unit Tests (`test_ml.py`)
- **Inference Stability**: Verifies the cached ML service (`predict_yield` and `recommend_crop`) executes correctly against hardcoded feature bounds.
- **Input Validation**: Ensures out-of-bound or unknown feature categories fall back securely without crashing the server.

### Execution
Run tests locally using:
```bash
cd backend
PYTHONPATH=. venv/bin/pytest tests/
```

## Frontend Validation
The React/Next.js frontend relies on `TypeScript` for strict static type checking of the `FarmResponse` and `TokenResponse` models, guaranteeing that the frontend only renders what the backend explicitly provides (preventing mocked placeholder data).
The frontend build is validated via `npm run build` and `npm run lint`.
