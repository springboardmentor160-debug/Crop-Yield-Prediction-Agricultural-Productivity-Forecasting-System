# UI Wireframes & Workflow Planning

Mandatory views for Milestone 1, Task 3. Add actual Figma/Balsamiq exports or screenshots alongside this file and reference them below.

## 1. Authentication Screen
Clean Login and Signup panels with user input validation alerts.

- Login: email, password, submit
- Signup: full name, email, password, role selection (Farmer / Admin / Analyst)
- Inline validation errors (empty fields, invalid email, password mismatch)
- Tab or link to switch between Login and Signup

**Reference implementation:** `frontend/app/page.tsx`

## 2. Farm Onboarding Asset
A data grid interface providing fields to append new acreage metrics, geo-coordinates, and active soil elements.

- Fields: farm name, location, area (hectares), soil pH, latitude, longitude
- Add/Save/Cancel actions
- List/grid view of existing farms with key metrics displayed (area, soil pH)

**Reference implementation:** Farms section of `frontend/app/dashboard/page.tsx`

## 3. Dashboard Shell
Container objects featuring placeholder UI state alerts, ready for upcoming machine learning charts (yield estimations, climate maps, feature coefficients).

- Header with branding, user name/role, logout
- Stat cards: total farms, predictions, alerts, recommendations
- Module navigation tiles: yield prediction, weather analysis, soil analysis, recommendations
- Empty states for "no farms yet," "no predictions yet," etc.
- Role-based variants: Farmer, Analyst, Admin dashboards

**Reference implementation:** `frontend/app/dashboard/page.tsx`, `frontend/components/dashboard/`

## Design System Reference

- Palette: deep forest green (primary), harvest gold, soil brown, sky blue
- Typography: Space Grotesk (headings), Inter (body), IBM Plex Mono (stat figures)
- Cards use quiet left-border accents rather than full pastel fills

## Wireframe Assets