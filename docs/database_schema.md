# Database Schema

PostgreSQL relational schema for YieldSense AI (Milestone 1, Task 2). The executable version of this schema lives at the repo root in `schema`.

## Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique, not null |
| password_hash | VARCHAR(255) | Not null (bcrypt hash) |
| full_name | VARCHAR(255) | |
| role | VARCHAR(50) | Default `'Farmer'` — `'Farmer'`, `'Admin'`, `'Analyst'` |

### `farms`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| user_id | INT | FK → `users(id)`, `ON DELETE CASCADE` |
| farm_name | VARCHAR(100) | |
| location | VARCHAR(255) | |
| latitude | NUMERIC(9,6) | |
| longitude | NUMERIC(9,6) | |
| area_hectares | NUMERIC(10,2) | |
| soil_ph | NUMERIC(3,2) | |

### `crops`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| farm_id | INT | FK → `farms(id)`, `ON DELETE CASCADE` |
| crop_name | VARCHAR(100) | |
| hectares_planted | NUMERIC(10,2) | |
| planting_date | DATE | |

## Relationships

```
users (1) ──< (many) farms (1) ──< (many) crops
```

- One user can have many farms.
- One farm can have many crop records.
- Deleting a user cascades to delete their farms; deleting a farm cascades to delete its crops.

## Indexes

```sql
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
```

## Notes

- The project blueprint specifies **PostgreSQL** as the primary relational database (see `project_requirements.md`, Tools & Tech Stack). Development environments should not diverge to SQLite for anything intended to be graded/reviewed.
- MongoDB is listed as a secondary database option for operational/unstructured data (e.g. logs, notifications) — not required for the core relational schema above.
