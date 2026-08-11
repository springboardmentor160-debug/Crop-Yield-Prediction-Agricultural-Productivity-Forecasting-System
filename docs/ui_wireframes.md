# UI Wireframes & Layout Planning - YieldSense AI

This document maps out the layout, elements, and states of the interactive pages built inside the `frontend/` workspace directory.

## 1. Authentication View (`app/login/page.tsx`)
- **Aesthetic**: Premium dark gradient background with ambient glowing orbs and glassmorphism panel styling.
- **Components**:
  - Header text ("Welcome Back")
  - Username/Email field (Pre-filled for mock verification)
  - Password input (Pre-filled for mock verification)
  - **Login As Role Selection Dropdown**: Dynamically routes the user to their matching dashboard profile:
    - Farmer $\rightarrow$ `/dashboard/farmer`
    - Administrator $\rightarrow$ `/dashboard/administrator`
    - Agri Consultant $\rightarrow$ `/dashboard/consultant`
    - Researcher $\rightarrow$ `/dashboard/researcher`
    - Agriculture Department $\rightarrow$ `/dashboard/department`

## 2. Farmer Dashboard View (`app/dashboard/farmer/page.tsx`)
- **Aesthetic**: Responsive sidebar layout, premium dark themes, cards featuring translucent glass borders.
- **Components**:
  - **Sidebar Panel**: Tab routing (Dashboard, Farm Data, Weather Logs, Logout).
  - **Metrics Cards Grid** (Top):
    - **Predicted Yield**: Displays estimated forecast output (updated dynamically via API).
    - **Soil Suitability**: Displays current soil fertility status (updated dynamically via API).
    - **Weather Assessment**: Displays climate stress status (updated dynamically via API).
  - **Calculate Forecast Form Card** (Bottom Left): Inputs for Temperature, Rainfall, and Soil pH with a "Forecast Yield" submit button.
  - **Inference Engine Diagram Card** (Bottom Right): Visualization placeholder detailing the running XGBoost model.

## 3. Administrator Console (`app/dashboard/administrator/page.tsx`)
- **Components**:
  - **User Directory**: Active accounts ledger with buttons to suspend or activate users.
  - **DB Schema Audits**: Live code column structures for the PostgreSQL `users`, `farms`, and `crops` tables.
  - **Logs Console**: Live terminal stream mapping uvicorn events.

## 4. Agri Consultant Hub (`app/dashboard/consultant/page.tsx`)
- **Components**:
  - **Client Farm Registry**: Detail card summaries of soils and crop targets.
  - **Advisory Form Queue**: Advisory textarea to write and publish custom N-P-K fertilizer recommendations.

## 5. Agricultural Research Lab (`app/dashboard/researcher/page.tsx`)
- **Components**:
  - **Datasets Overview**: Rows, sizes, and column structures of raw sheets.
  - **Algorithm Comparisons**: Statistics table showing $R^2$, MAE, and RMSE scores of scikit-learn models.

## 6. Agriculture Department Portal (`app/dashboard/department/page.tsx`)
- **Components**:
  - **Yield Subsidies Ledger**: Active financial subsidy payouts list with release buttons.
  - **Crop Distribution Stats**: Seasonal share breakdowns of regional products.
