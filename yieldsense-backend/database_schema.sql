CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT,
    role VARCHAR(20)
);

CREATE TABLE farms (
    farm_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    location VARCHAR(100),
    size_hectares DECIMAL(10,2)
);

CREATE TABLE crops (
    crop_id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(farm_id),
    crop_type VARCHAR(50),
    planting_date DATE
);