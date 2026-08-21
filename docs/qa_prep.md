# YieldSense AI — Q&A Prep

Write your real answers under each — don't leave these generic. Panels
can tell the difference between a rehearsed real answer and a guess.

## 1. "Why did you choose [XGBoost] instead of [alternative]?"
Your answer:
> _e.g. "XGBoost handles the mixed numeric feature set (soil, weather,
> area) well without heavy preprocessing, and gives built-in feature
> importance, which I used for the explainability endpoint."_

## 2. "What was the hardest part, and how did you solve it?"
Your answer:
> _Pick one real one — e.g. wiring confidence scores from tree variance,
> or getting role-based access consistent across Farmer/Analyst/Admin._

## 3. "How is [confidence score / productivity score / risk level] calculated?"
Know these cold — you have the exact formulas:
- **Confidence score**: variance across tree predictions (RandomForest)
  or across incremental boosting rounds (XGBoost), converted to a 0–100
  scale where lower relative spread = higher confidence.
- **Weather/soil scores**: deviation from ideal crop-specific ranges,
  normalized 0–100.
- **Risk level**: additive rule-based score — yield deviation + rainfall
  deviation + soil pH deviation, thresholded into Low/Medium/High.
- **Productivity score**: `min(100, (avg_yield / 6) * 100)` — capped
  against a reference max yield of 6 t/ha.

## 4. "What would you do differently with more time?"
Your answer:
> _e.g. real weather API integration instead of mocked data, more crop
> types, a proper Redis cache instead of DB-backed TTL cache._

## 5. "How does this scale if data/users grew 10x?"
Your answer:
> _e.g. DB indexes on farm_id/user_id/created_at, weather response
> caching already in place, model inference is stateless so it
> horizontally scales behind a load balancer._

## 6. "What did you personally build vs. use from a library/template?"
Your answer:
> _Be specific: the recommendation/risk rule engine, the confidence
> scoring logic, the analyst dashboard, vs. XGBoost itself, FastAPI,
> Next.js as frameworks._

## Know cold before you walk in
- [ ] Model MAE, RMSE, R² — exact numbers from your last training run
- [ ] One design decision you can defend in under 45 seconds
- [ ] One thing your project does NOT do yet (own it, don't dodge it)
