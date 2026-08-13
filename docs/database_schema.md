# YieldSense AI — Database Schema (PostgreSQL)

## Entity Relationship Overview

```
users (1) ───< (many) farms (1) ───< (many) crops
```

One user can own many farms. One farm can have many crop records (across seasons).

---

## Table: users

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(50) | DEFAULT 'Farmer' — values: 'Farmer', 'Admin' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table: farms

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| user_id | INT | REFERENCES users(id) ON DELETE CASCADE |
| farm_name | VARCHAR(100) | |
| latitude | NUMERIC(9,6) | |
| longitude | NUMERIC(9,6) | |
| size_hectares | NUMERIC(10,2) | |
| soil_ph | NUMERIC(3,2) | |
| soil_nitrogen | NUMERIC(6,2) | optional |
| soil_phosphorus | NUMERIC(6,2) | optional |
| soil_potassium | NUMERIC(6,2) | optional |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    size_hectares NUMERIC(10,2),
    soil_ph NUMERIC(3,2),
    soil_nitrogen NUMERIC(6,2),
    soil_phosphorus NUMERIC(6,2),
    soil_potassium NUMERIC(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table: crops

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| farm_id | INT | REFERENCES farms(id) ON DELETE CASCADE |
| crop_name | VARCHAR(100) | e.g. "Wheat", "Rice" |
| hectares_planted | NUMERIC(10,2) | |
| planting_date | DATE | |
| predicted_yield | NUMERIC(10,2) | kg/ha — filled after ML inference |
| actual_yield | NUMERIC(10,2) | optional, for model evaluation |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    hectares_planted NUMERIC(10,2),
    planting_date DATE,
    predicted_yield NUMERIC(10,2),
    actual_yield NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Notes

- `ON DELETE CASCADE` ensures that deleting a user removes their farms, and deleting a
  farm removes its crop records — keeping referential integrity clean.
- `role` on `users` drives RBAC checks in the backend (Farmer vs Admin permissions).
- `predicted_yield` and `actual_yield` on `crops` support future model evaluation
  (comparing forecasts against real harvest results).
