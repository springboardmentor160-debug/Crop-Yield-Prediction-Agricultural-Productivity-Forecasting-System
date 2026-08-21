# YieldSense AI — UI Wireframes & Workflow Planning

## Design Tool
Figma (recommended) — link: _add your Figma project link here once created_

## Screen 1: Login / Registration Page

```
┌────────────────────────────────┐
│         YieldSense AI          │
│                                 │
│  [ Email address        ]      │
│  [ Password              ]      │
│                                 │
│         [ Login ]              │
│                                 │
│  Don't have an account? Sign Up│
└────────────────────────────────┘
```

**Elements:**
- Email input (with validation)
- Password input (masked)
- Login button
- Link to registration form
- Error/success alert banner

---

## Screen 2: Farm Profile / Onboarding Page

```
┌────────────────────────────────────────┐
│   Add New Farm                         │
│                                         │
│   Farm Name:      [____________]       │
│   Location (lat):  [______]            │
│   Location (long): [______]            │
│   Size (hectares): [______]            │
│   Soil pH:         [______]            │
│   Soil N-P-K:      [__] [__] [__]      │
│   Crop Type:       [Dropdown ▾]        │
│                                         │
│            [ Save Farm ]               │
└────────────────────────────────────────┘
```

**Elements:**
- Data grid / form layout for farm details
- Geo-coordinate inputs (map picker optional enhancement)
- Soil parameter inputs
- Crop type dropdown
- Save/submit button

---

## Screen 3: Dashboard (Placeholder)

```
┌───────────────────────────────────────────────┐
│  YieldSense AI Dashboard        [Profile] [⏻] │
├───────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐          │
│  │ Predicted Yield│  │ Weather Widget│          │
│  │   [chart]      │  │   [icons]     │          │
│  └───────────────┘  └───────────────┘          │
│  ┌───────────────┐  ┌───────────────┐          │
│  │ Risk Assessment│  │ Recommendations│         │
│  │   [alerts]     │  │   [tips list] │          │
│  └───────────────┘  └───────────────┘          │
│  ┌─────────────────────────────────┐            │
│  │  Seasonal Performance (chart)   │            │
│  └─────────────────────────────────┘            │
└───────────────────────────────────────────────┘
```

**Elements:**
- Yield prediction chart (empty state placeholder)
- Weather widget placeholder
- Risk assessment alert boxes
- Recommendation tips list
- Seasonal performance graph placeholder

---

## Navigation Flow

```
Login/Register → Dashboard (empty state) → Add Farm → Farm Profile saved
                                          → Dashboard (populated with farm data)
                                          → View Prediction & Recommendations
```

## Notes for Frontend Implementation

- Use Tailwind CSS utility classes for consistent spacing/typography
- Charts: Chart.js or Recharts (per tech stack)
- Keep dashboard boxes as empty/placeholder components in Milestone 1 — real data
  wiring happens in Milestone 2 onward
