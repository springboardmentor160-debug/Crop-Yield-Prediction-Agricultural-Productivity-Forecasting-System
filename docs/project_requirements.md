# YieldSense AI - Project Requirements

## 1. Problem Statement

Farmers face uncertainty in crop production due to changing weather conditions, soil fertility variations, environmental risks, and lack of accessible predictive tools.

Traditional agricultural decision-making may depend heavily on historical experience and manual analysis. YieldSense AI addresses this problem by providing a digital platform that uses machine learning, environmental information, and agricultural analysis to support crop-yield forecasting and farming decisions.

---

## 2. Project Objective

The primary objective of YieldSense AI is to develop an AI-powered agricultural productivity forecasting platform that can:

- Predict crop yield using machine learning.
- Analyze agricultural and environmental parameters.
- Integrate weather information.
- Provide crop recommendations.
- Assess agricultural risks.
- Store prediction history.
- Provide dashboard-based analytics.
- Generate downloadable prediction reports.

---

## 3. Functional Requirements

### 3.1 User Registration

The system shall allow users to:

- Create an account.
- Provide their name, email, password, and role.
- Store user information in PostgreSQL.
- Securely hash passwords before storage.

### 3.2 User Login

The system shall:

- Authenticate registered users.
- Verify login credentials.
- Generate a JWT access token after successful authentication.
- Use the token to access protected APIs.

### 3.3 Crop Yield Prediction

The system shall allow authenticated users to provide:

- Area/location
- Crop type
- Year
- Average rainfall
- Pesticide usage
- Average temperature
- Soil pH

The system shall use these inputs to generate an estimated crop yield.

### 3.4 Weather Integration

The system shall integrate live weather information for the requested location.

Weather information may include:

- Temperature
- Rainfall
- Humidity
- Weather condition
- Wind speed

### 3.5 AI Crop Recommendation

The system shall provide:

- Recommended crop
- Confidence score
- Recommendation reasons
- Farmer advice

### 3.6 Risk Assessment

The system shall analyze environmental and soil conditions including:

- Rainfall
- Temperature
- Soil pH

The system shall classify agricultural conditions into risk levels and generate corresponding alerts and recommendations.

### 3.7 Prediction History

The system shall store prediction results in PostgreSQL.

Stored prediction information includes:

- User email
- Crop
- Rainfall
- Pesticide usage
- Temperature
- Soil pH
- Estimated yield
- Risk level
- Recommendation
- Prediction timestamp

### 3.8 Dashboard Analytics

The system shall provide dashboard statistics including:

- Total predictions
- Average yield
- Best-performing crop
- Current risk
- Prediction history
- Yield analytics

### 3.9 Report Export

The system shall allow prediction records to be exported in CSV format for:

- Record keeping
- Agricultural analysis
- Research
- Further data processing

---

## 4. Machine Learning Requirements

The machine learning component shall:

1. Load the agricultural dataset.
2. Clean and preprocess the data.
3. Remove duplicate records.
4. Handle missing numerical values.
5. Encode categorical variables.
6. Prepare training and testing datasets.
7. Train multiple regression models.
8. Evaluate model performance.
9. Select the best-performing model.
10. Save the trained model for prediction.

### Machine Learning Models

The system evaluates:

- Linear Regression
- Decision Tree Regressor
- Random Forest Regressor
- Gradient Boosting Regressor

### Evaluation Metrics

The models are evaluated using:

- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- R² Score

---

## 5. Dataset Requirements

The project uses:

```text
datasets/
├── raw/
│   └── crop_yield_raw.csv
│
└── processed/
    └── crop_yield_cleaned.csv

---

## 6. Non-Functional Requirements

### 6.1 Security

The system shall:

- Hash user passwords.
- Use JWT-based authentication.
- Protect authenticated API endpoints.
- Avoid exposing sensitive credentials in application responses.

### 6.2 Performance

The system should:

- Process prediction requests efficiently.
- Return dashboard information quickly.
- Store prediction results reliably.

### 6.3 Reliability

The system should:

- Validate user input.
- Handle invalid authentication tokens.
- Handle weather API failures.
- Maintain prediction history in the database.

### 6.4 Usability

The system should provide:

- Simple registration and login.
- Easy-to-use prediction input.
- Clear prediction results.
- Understandable risk alerts.
- Interactive dashboard analytics.

---

## 7. Technology Requirements

### Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend

- Python
- FastAPI
- Uvicorn

### Database

- PostgreSQL
- SQLAlchemy

### Machine Learning

- Scikit-learn
- Pandas
- NumPy
- Joblib

### Authentication

- JWT
- Passlib
- bcrypt

### Weather Integration

- OpenWeather API

---

## 8. API Requirements

The backend shall provide APIs for:

```text
GET  /
POST /register
POST /login

POST /api/v1/predict-yield
GET  /api/v1/predictions
GET  /api/v1/dashboard-stats
GET  /api/v1/reports/export-csv
## 9. Database Requirements

The system shall use PostgreSQL for persistent data storage.

The database shall store:

- User accounts
- Prediction records
- Crop information
- Environmental parameters
- Risk information
- Recommendations
- Prediction timestamps

SQLAlchemy shall be used as the database ORM.

---

## 10. Authentication and Authorization Requirements

The authentication system shall:

- Register new users.
- Hash passwords before storing them.
- Authenticate users during login.
- Generate JWT access tokens.
- Validate JWT tokens for protected APIs.
- Support user roles such as Farmer and Admin.

---

## 11. Prediction Processing Requirements

The prediction workflow shall:

1. Receive prediction parameters from the frontend.
2. Validate the submitted input.
3. Encode categorical values where required.
4. Load the trained machine learning model.
5. Generate the estimated crop yield.
6. Analyze agricultural risk conditions.
7. Generate recommendations.
8. Store the prediction result in PostgreSQL.
9. Return the prediction result to the frontend.

---

## 12. Weather Service Requirements

The weather service shall:

- Accept a requested location.
- Connect to the OpenWeather API.
- Retrieve current weather information.
- Provide temperature information.
- Provide rainfall information when available.
- Provide humidity.
- Provide weather condition.
- Provide wind speed.
- Handle API connection or request failures gracefully.

---

## 13. Reporting Requirements

The reporting component shall:

- Retrieve prediction records from PostgreSQL.
- Prepare prediction data for export.
- Generate CSV output.
- Include relevant prediction information.
- Support record keeping and further agricultural analysis.

---

## 14. System Integration Requirements

The major system components shall work together as follows:

- Frontend communicates with the FastAPI backend.
- FastAPI handles authentication and application APIs.
- The machine learning layer generates crop-yield predictions.
- The weather service provides live environmental information.
- PostgreSQL stores users and prediction history.
- The dashboard displays prediction and analytics information.
- The reporting component provides downloadable CSV reports.

---

## 15. Expected System Outcome

The completed YieldSense AI system shall provide an integrated agricultural productivity forecasting platform that combines:

- Machine learning-based crop-yield prediction
- Weather information
- Agricultural risk assessment
- Crop recommendations
- Secure user authentication
- Prediction history
- Dashboard analytics
- CSV reporting

The system is intended to help farmers make more informed agricultural decisions using data-driven insights.

