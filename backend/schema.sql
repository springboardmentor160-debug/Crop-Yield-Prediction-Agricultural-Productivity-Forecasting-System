CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer' CHECK (role IN ('Farmer', 'Admin', 'Agriculture Expert')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    experience_years INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    farm_size NUMERIC(10,2) NOT NULL,
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    crops_grown TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_records (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(50),
    area_cultivated NUMERIC(10,2) NOT NULL,
    production_amount NUMERIC(12,2),
    rainfall NUMERIC(8,2),
    temperature NUMERIC(5,2),
    fertilizer_usage NUMERIC(8,2),
    previous_yield NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_records (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    ph_value NUMERIC(3,2) NOT NULL,
    nitrogen NUMERIC(8,2),
    phosphorus NUMERIC(8,2),
    potassium NUMERIC(8,2),
    organic_matter NUMERIC(5,2),
    fertility_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_records (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    rainfall NUMERIC(8,2),
    average_temperature NUMERIC(5,2),
    humidity NUMERIC(5,2),
    climate_condition VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historical_farming_records (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    year INT NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    yield_amount NUMERIC(10,2) NOT NULL,
    rainfall NUMERIC(8,2),
    temperature NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dataset_uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Uploaded',
    row_count INT DEFAULT 0,
    missing_values INT DEFAULT 0,
    columns_found TEXT,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS prediction_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    crop_name VARCHAR(100),
    avg_temp NUMERIC(5,2),
    rainfall NUMERIC(8,2),
    soil_ph NUMERIC(3,2),
    nitrogen NUMERIC(8,2),
    phosphorus NUMERIC(8,2),
    potassium NUMERIC(8,2),
    predicted_yield NUMERIC(10,2),
    confidence_score NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


