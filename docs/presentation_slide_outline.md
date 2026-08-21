# YieldSense AI — Final Presentation Slide Outline
Following the Final Project Presentation & Demo Guide's 10-slide template,
filled in with your actual project. Use this as the content for your
PPT — one slide per section below, 6x6 rule (max 6 bullets, max 6 words each).

---

## Slide 1 — Title
- **YieldSense AI**
- [Your name] · [Batch/Team]
- Tagline: "AI-powered crop yield forecasting, from soil to harvest."

## Slide 2 — Agenda
- The problem farmers face
- What we built & how it works
- Live demo
- Results & what's next

## Slide 3 — Problem Statement
- Farmers plan blind — no yield forecast
- Soil, weather, prediction data are siloed
- Poor planning → wasted inputs, lower yield
- (Add a real stat if you have one, e.g. avg yield variance %)

## Slide 4 — Objective & Outcomes
- Predict yield from soil + weather + crop data
- Turn predictions into plain-language advice
- Flag risk before it becomes crop loss
- Give analysts a platform-wide view

## Slide 5 — Approach / Architecture
Simple boxes-and-arrows diagram:
```
[Farmer Input] → [FastAPI Backend] → [XGBoost Model]
                        ↓
        [Weather API]  [Soil Analysis]
                        ↓
      [Recommendations] [Risk Score] [Dashboard]
```

## Slide 6 — Tools & Tech Stack
- Backend: FastAPI, PostgreSQL
- Frontend: Next.js, TypeScript, Tailwind
- ML: XGBoost, Scikit-learn
- Deployed: Docker, [AWS/Azure]

## Slide 7 — Key Results / Features (your strongest slide)
- Screenshot: prediction result with confidence score
- Screenshot: analyst farm-comparison dashboard
- Model accuracy: MAE [X], RMSE [X], R² [X]
- Recommendation + risk shown together

## Slide 8 — Challenges & Learnings
- [Real obstacle #1 you hit] → [how you solved it]
- [Real obstacle #2] → [how you solved it]
- (Panels remember and ask about this slide — pick genuine ones,
  e.g. "confidence scoring with XGBoost," "CORS/auth debugging",
  "structuring role-based access across 3 user types")

## Slide 9 — Conclusion & Future Scope
- One sentence: what YieldSense AI proves
- Next: mobile app / more crops / satellite imagery
- Next: retraining pipeline, more regions

## Slide 10 — Thank You / Questions
- GitHub link
- Contact
- "Now let's see it live" → transition into demo

---

## Notes
- 8–10 slides total, ~30–40 sec per slide for a 5-minute overview.
- Body text ≥24pt, titles 32–40pt.
- One accent color + one font family, used consistently.
- Cite any external dataset/number that isn't yours, small text, bottom of slide.
