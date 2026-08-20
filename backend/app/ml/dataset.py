"""
Synthetic agricultural training data generator.

No proprietary dataset ships with this repo (see README for how to swap
in FAOSTAT / USDA / Kaggle data as described in the project brief). To
make the yield-prediction pipeline runnable end-to-end out of the box,
this module generates a large synthetic dataset whose input-output
relationships are grounded in real agronomic principles:

- Each crop has an optimal temperature band and rainfall requirement;
  yield falls off the further conditions drift from that optimum
  (a Gaussian-shaped response curve, consistent with agronomic
  yield-response literature).
- Soil pH close to 6.0-7.0 maximises nutrient availability for most
  crops; N-P-K show diminishing returns above typical uptake levels.
- Irrigation availability buffers rainfall variability.
- Random noise represents unmodelled factors (pests, management
  quality, micro-climate) so the model must learn robust patterns
  rather than memorising a deterministic formula.

Replace `generate_training_dataframe()` with a loader over a real
dataset (FAOSTAT/USDA/Kaggle) for production use; the feature schema
below is designed to match columns available in those sources.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

# crop_name: (optimal_temp_c, temp_tolerance, optimal_rainfall_mm, rainfall_tolerance, base_yield_kg_per_ha)
CROP_PROFILES: dict[str, dict[str, float]] = {
    "Wheat":    {"opt_temp": 22, "temp_tol": 7,  "opt_rain": 500,  "rain_tol": 200, "base_yield": 3200},
    "Rice":     {"opt_temp": 27, "temp_tol": 5,  "opt_rain": 1200, "rain_tol": 400, "base_yield": 4200},
    "Maize":    {"opt_temp": 24, "temp_tol": 6,  "opt_rain": 600,  "rain_tol": 250, "base_yield": 5200},
    "Soybean":  {"opt_temp": 25, "temp_tol": 6,  "opt_rain": 550,  "rain_tol": 200, "base_yield": 2800},
    "Cotton":   {"opt_temp": 28, "temp_tol": 6,  "opt_rain": 700,  "rain_tol": 250, "base_yield": 1900},
    "Sugarcane":{"opt_temp": 27, "temp_tol": 5,  "opt_rain": 1500, "rain_tol": 400, "base_yield": 68000},
    "Barley":   {"opt_temp": 18, "temp_tol": 7,  "opt_rain": 450,  "rain_tol": 180, "base_yield": 2900},
    "Potato":   {"opt_temp": 18, "temp_tol": 5,  "opt_rain": 500,  "rain_tol": 180, "base_yield": 21000},
}

SEASONS = ["Kharif", "Rabi", "Zaid"]
IRRIGATION_TYPES = ["Rainfed", "Drip", "Sprinkler", "Flood"]
SOIL_TEXTURES = ["Sandy", "Loam", "Clay", "Silty"]


def _gaussian_response(value: float, optimum: float, tolerance: float) -> float:
    """Returns 1.0 at the optimum, decaying towards 0 as `value` drifts away."""
    return float(np.exp(-((value - optimum) ** 2) / (2 * tolerance ** 2)))


def generate_training_dataframe(n_samples: int = 6000) -> pd.DataFrame:
    rows = []
    crop_names = list(CROP_PROFILES.keys())

    for _ in range(n_samples):
        crop = crop_names[RNG.integers(0, len(crop_names))]
        profile = CROP_PROFILES[crop]

        temperature_c = float(RNG.normal(profile["opt_temp"], profile["temp_tol"] * 1.3))
        rainfall_mm = max(0.0, float(RNG.normal(profile["opt_rain"], profile["rain_tol"] * 1.3)))
        humidity_pct = float(np.clip(RNG.normal(65, 15), 20, 100))
        ph_level = float(np.clip(RNG.normal(6.5, 0.9), 4.0, 9.0))
        nitrogen_ppm = float(np.clip(RNG.normal(45, 18), 5, 120))
        phosphorus_ppm = float(np.clip(RNG.normal(30, 12), 3, 90))
        potassium_ppm = float(np.clip(RNG.normal(40, 15), 5, 110))
        organic_matter_pct = float(np.clip(RNG.normal(2.5, 1.0), 0.2, 8.0))
        area_hectares = float(np.clip(RNG.exponential(3.5), 0.25, 40))
        irrigation_type = IRRIGATION_TYPES[RNG.integers(0, len(IRRIGATION_TYPES))]
        soil_texture = SOIL_TEXTURES[RNG.integers(0, len(SOIL_TEXTURES))]
        season = SEASONS[RNG.integers(0, len(SEASONS))]

        # --- Response curves (all in [0, 1], multiplied together) ---
        temp_response = _gaussian_response(temperature_c, profile["opt_temp"], profile["temp_tol"])
        rain_response = _gaussian_response(rainfall_mm, profile["opt_rain"], profile["rain_tol"])
        ph_response = _gaussian_response(ph_level, 6.5, 1.1)

        # Nutrient response: diminishing returns via saturating (Michaelis-Menten-like) curve
        n_response = nitrogen_ppm / (nitrogen_ppm + 35)
        p_response = phosphorus_ppm / (phosphorus_ppm + 22)
        k_response = potassium_ppm / (potassium_ppm + 28)
        nutrient_response = (n_response + p_response + k_response) / 3

        organic_response = float(np.clip(organic_matter_pct / 4.0, 0.3, 1.15))

        irrigation_bonus = {"Rainfed": 0.85, "Flood": 0.95, "Sprinkler": 1.05, "Drip": 1.12}[irrigation_type]

        # If irrigated, rainfall shortfall matters less
        if irrigation_type != "Rainfed":
            rain_response = min(1.0, rain_response + 0.25)

        combined_response = (
            0.30 * temp_response
            + 0.25 * rain_response
            + 0.15 * ph_response
            + 0.20 * nutrient_response
            + 0.10 * organic_response
        )
        combined_response = float(np.clip(combined_response, 0.05, 1.15))

        noise = float(RNG.normal(1.0, 0.08))
        yield_kg_per_ha = max(
            150.0,
            profile["base_yield"] * combined_response * irrigation_bonus * noise,
        )

        rows.append(
            {
                "crop_name": crop,
                "season": season,
                "temperature_c": round(temperature_c, 2),
                "rainfall_mm": round(rainfall_mm, 2),
                "humidity_pct": round(humidity_pct, 2),
                "ph_level": round(ph_level, 2),
                "nitrogen_ppm": round(nitrogen_ppm, 2),
                "phosphorus_ppm": round(phosphorus_ppm, 2),
                "potassium_ppm": round(potassium_ppm, 2),
                "organic_matter_pct": round(organic_matter_pct, 2),
                "area_hectares": round(area_hectares, 2),
                "irrigation_type": irrigation_type,
                "soil_texture": soil_texture,
                "yield_kg_per_ha": round(yield_kg_per_ha, 1),
            }
        )

    return pd.DataFrame(rows)


CROP_BENCHMARK_YIELD = {name: profile["base_yield"] for name, profile in CROP_PROFILES.items()}
