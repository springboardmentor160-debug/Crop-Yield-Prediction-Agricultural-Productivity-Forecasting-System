# Agricultural Forecasting Workflow

```
User Login → Farm Profile Creation → Weather API Enrichment → Unified Dataset → ML Prediction → Dashboard
```

**Step A — Authentication:** Farmer logs in; frontend receives a JWT and attaches it to
future requests.

**Step B — Farm Profile Creation:** Farmer enters crop type, location (lat/long), and
soil test results (N-P-K, pH).

**Step C — Weather Enrichment:** Backend calls a Weather API using the farm's
coordinates and stores historical + forecasted rainfall/temperature data.

**Step D — Data Unification:** Soil data + weather data + crop type are combined into
one feature set.

**Step E — Prediction (future milestone):** Feature set is passed into the trained
ML model, producing a yield estimate (kg/ha), confidence score, and risk flags.

**Step F — Dashboard Display:** Results and farming recommendations are rendered on
the user's dashboard.
