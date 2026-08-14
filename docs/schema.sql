CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Farmer'
);

CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    soil_ph NUMERIC(3,2)
);

CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    hectares_planted NUMERIC(10,2)
);