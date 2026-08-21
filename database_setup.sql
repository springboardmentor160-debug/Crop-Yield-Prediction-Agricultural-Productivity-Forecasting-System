-- Database Creation Instructions
-- 1. Connect to PostgreSQL via pgAdmin using an admin user (e.g., postgres)
-- 2. Open the Query Tool and execute the following:

CREATE USER postgres WITH ENCRYPTED PASSWORD '1234567890';
CREATE DATABASE yieldsense OWNER postgres;

-- 3. Disconnect from the current database and connect to `yieldsense`
-- 4. Execute the following schema creation script:

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer' NOT NULL, -- 'Farmer', 'Admin'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    soil_ph NUMERIC(3,2),
    soil_n NUMERIC(6,2),
    soil_p NUMERIC(6,2),
    soil_k NUMERIC(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    hectares_planted NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);
