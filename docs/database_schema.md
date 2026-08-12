# Database Schema

## Users Table
- id
- name
- email
- password
- role

## Farms Table
- farm_id
- user_id
- crop_name
- location
- area

## Soil Data Table
- soil_id
- farm_id
- nitrogen
- phosphorus
- potassium
- ph

## Weather Data Table
- weather_id
- farm_id
- rainfall
- temperature

## Predictions Table
- prediction_id
- farm_id
- predicted_yield