# YieldSense AI: Cloud & Container Deployment Guide

This document outlines the deployment strategy and detailed steps for hosting the YieldSense AI platform, covering local container orchestration (Docker Compose) and cloud architectures on **AWS** and **Azure**.

---

## 🐋 1. Local Containerized Deployment (Docker Compose)

The entire platform is containerized using multi-stage builds to minimize image sizes.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
* Ports `3000` (frontend), `8000` (backend), and `5432` (database) must be available.

### Run Stack Locally
From the root directory:
```bash
docker-compose up --build
```
This command orchestrates:
1. **`db`**: A PostgreSQL container initialized with credentials.
2. **`backend`**: FastAPI application exposed on port `8000`.
3. **`frontend`**: Next.js client running in development mode on port `3000`.

---

## ☁️ 2. Cloud Architecture: Amazon Web Services (AWS)

For a production-grade deployment on AWS, we separate application servers (Serverless Containers) from the database layer (Managed Relational Database) for scalability and security.

### Architecture Components
* **Compute**: AWS ECS (Elastic Container Service) with AWS Fargate (Serverless).
* **Database**: Amazon RDS for PostgreSQL.
* **Routing & Security**: Application Load Balancer (ALB) and AWS Certificate Manager (ACM).
* **Asset Storage**: Amazon S3 (for backup models and crop data).

```mermaid
graph TD
    Client[Web Client] -->|HTTPS| ALB[Application Load Balancer]
    ALB -->|Path: /api/*| ECS_API[ECS Fargate: FastAPI Backend]
    ALB -->|Path: /*| ECS_WEB[ECS Fargate: Next.js Frontend]
    ECS_API --> RDS[(Amazon RDS PostgreSQL)]
```

### Step-by-Step AWS Deployment Steps

#### Step 2.1: Provision the Managed Database (RDS)
1. Go to AWS Console -> RDS -> **Create database**.
2. Select **PostgreSQL**.
3. Choose **Free Tier** or **Production** template.
4. Set Master Username (`postgres`) and Password.
5. In **Connectivity**, ensure the DB instance is in the same VPC as your upcoming ECS containers but not publicly accessible.
6. Note down the Database Endpoint URL.

#### Step 2.2: Build and Push Docker Images to Amazon ECR
1. Create two repositories in Amazon ECR (Elastic Container Registry): `yieldsense-backend` and `yieldsense-frontend`.
2. Authenticate your local Docker terminal with ECR:
   ```bash
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
   ```
3. Build and tag your production images:
   ```bash
   docker build -t yieldsense-backend ./backend
   docker tag yieldsense-backend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/yieldsense-backend:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/yieldsense-backend:latest
   ```
4. Repeat the same tagging and pushing process for the Next.js frontend image.

#### Step 2.3: Configure ECS Task Definitions and Services
1. Go to ECS -> **Task Definitions** -> **Create new Task Definition with JSON**.
2. Specify the ECR image URI in the container configurations.
3. Inject the production environment variables (e.g. `DATABASE_URL=postgresql://user:password@rds-endpoint:5432/dbname`).
4. Set memory to `0.5 GB` and CPU to `0.25 vCPU` (Fargate base configuration).
5. Create an ECS Cluster and launch services for the frontend and backend using Fargate.

#### Step 2.4: Setup Route ALB & HTTPS Routing
1. Set up an ALB in your target public subnets.
2. Direct default path routing (`/*`) to the Next.js frontend target group (port `3000`).
3. Direct API path routing (`/api/*` and `/docs`) to the FastAPI backend target group (port `8000`).

---

## ☁️ 3. Cloud Architecture: Microsoft Azure

Alternatively, deploy the system using Azure Container Apps (ACA) for serverless container grouping.

### Architecture Components
* **Compute**: Azure Container Apps (ACA) grouping frontend and backend containers.
* **Database**: Azure Database for PostgreSQL (Flexible Server).
* **Registry**: Azure Container Registry (ACR).

### Step-by-Step Azure Deployment Steps

#### Step 3.1: Provision Azure Database for PostgreSQL
```bash
az postgres flexible-server create --resource-group YieldResourceGroup --name yieldsense-db --admin-user postgres --admin-password <secure_password> --sku-name Standard_B1ms
```

#### Step 3.2: Create ACR and Upload Images
1. Create a registry container:
   ```bash
   az acr create --resource-group YieldResourceGroup --name yieldsenseregistry --sku Basic
   az acr login --name yieldsenseregistry
   ```
2. Build and push images directly using Azure ACR Task:
   ```bash
   az acr build --registry yieldsenseregistry --image yieldsense-backend:latest ./backend
   az acr build --registry yieldsenseregistry --image yieldsense-frontend:latest ./frontend
   ```

#### Step 3.3: Deploy Containers to Azure Container Apps
1. Create the Container App Environment.
2. Deploy the backend API Container App with target port `8000`.
3. Deploy the frontend Container App with target port `3000` and link the backend container environment ingress URL as the API base path environment variable.

---

## 🚀 4. Automated CI/CD (GitHub Actions Workflow)

Add this workflow to `.github/workflows/deploy.yml` to automate builds on repository updates:

```yaml
name: Deploy Production CI/CD

on:
  push:
    branches:
      - Tirutopu-Srivardhan

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install Dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run Backend Pytests
        run: |
          cd backend
          python -m pytest

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3
      # Add AWS/Azure Auth CLI commands here to push ECR/ACR and update ECS/Container Apps services.
```
