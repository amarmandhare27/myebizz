# MyEbizz - Complete AWS Deployment Guide

**Date**: May 31, 2026  
**Project**: MyEbizz Multi-Tenant E-Commerce Platform  
**Target**: Production-ready deployment on AWS

---

## TABLE OF CONTENTS

1. [Phase 1: AWS Account & Prerequisites Setup](#phase-1-aws-account--prerequisites-setup)
2. [Phase 2: Database Setup (RDS PostgreSQL)](#phase-2-database-setup-rds-postgresql)
3. [Phase 3: Backend Deployment (Spring Boot)](#phase-3-backend-deployment-spring-boot)
4. [Phase 4: Frontend Deployment (Next.js)](#phase-4-frontend-deployment-nextjs)
5. [Phase 5: Domain, SSL & CDN](#phase-5-domain-ssl--cdn)
6. [Phase 6: Environment Configuration](#phase-6-environment-configuration)
7. [Phase 7: Monitoring & Logging](#phase-7-monitoring--logging)
8. [Phase 8: Payment Gateway Configuration](#phase-8-payment-gateway-configuration)
9. [Phase 9: Email & Notifications](#phase-9-email--notifications)
10. [Phase 10: Backup & Disaster Recovery](#phase-10-backup--disaster-recovery)
11. [Phase 11: Performance Optimization](#phase-11-performance-optimization)
12. [Phase 12: Security Hardening](#phase-12-security-hardening)

---

# PHASE 1: AWS ACCOUNT & PREREQUISITES SETUP

## Step 1.1: Create AWS Account & Setup IAM

### Actions:
1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Click "Create an AWS Account"
   - Provide email, password, account name
   - Add payment method (credit/debit card)

2. **Enable MFA (Multi-Factor Authentication)**
   - Sign in as root user
   - Go to Security Credentials in Account settings
   - Enable MFA for extra security

3. **Create IAM User with Programmatic Access**
   - Go to IAM Console → Users → Add User
   - Enable: Console access + Programmatic access
   - Attach policy: `AdministratorAccess` (for development, restrict in production)
   - Download access key and secret
   - **SAVE THIS SECURELY** - You'll need it for AWS CLI

4. **Create S3 Bucket for Deployment Artifacts**
   - S3 → Create Bucket
   - Name: `myebizz-deployment-artifacts`
   - Block public access: ✓ Enable
   - Versioning: ✓ Enable
   - Server-side encryption: ✓ Enable

## Step 1.2: Setup AWS CLI

### Installation:
```bash
# Windows - Install via PowerShell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Or using Chocolatey
choco install awscliv2

# Verify installation
aws --version
```

### Configure AWS Credentials:
```bash
aws configure
# Enter:
# AWS Access Key ID: [from Step 1.1]
# AWS Secret Access Key: [from Step 1.1]
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### Verify Configuration:
```bash
aws sts get-caller-identity
```

## Step 1.3: Setup Required AWS Services

### Enable Services in AWS Console:
1. **RDS** - Database service
   - Go to RDS Dashboard
   - Ensure PostgreSQL is available in your region

2. **EC2** - Virtual servers (if not using managed services)
   - Go to EC2 Dashboard
   - Check available instance types

3. **CloudFront** - CDN for frontend
   - Go to CloudFront Dashboard
   - Enable distribution

4. **Route 53** - DNS management
   - Go to Route 53 Dashboard
   - Create hosted zone for your domain

5. **CloudWatch** - Monitoring
   - Already enabled by default

6. **Certificate Manager** - SSL certificates
   - Go to ACM Console
   - Request public certificate

---

# PHASE 2: DATABASE SETUP (RDS POSTGRESQL)

## Step 2.1: Create RDS PostgreSQL Instance

### Actions:
1. **Go to RDS Console**
   - Click "Create Database"
   - Choose PostgreSQL
   - Version: 15 or 16 (latest stable)

2. **Database Configuration**
   - **Database creation method**: Standard create
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 16.1 (or latest)
   - **Templates**: Production
   
3. **DB Instance Settings**
   - **DB instance identifier**: `myebizz-prod-db`
   - **Master username**: `dbadmin`
   - **Master password**: Generate strong password (25+ chars)
     - Example: `P@ssw0rd!MyEbizz#Prod$2026`
   - **SAVE THIS PASSWORD** - Store in AWS Secrets Manager

4. **DB Instance Size**
   - **Instance class**: `db.t3.small` (start here, scale up if needed)
   - **Storage**: 
     - Type: `gp3` (General Purpose)
     - Allocated storage: 100 GB
     - Max allocated storage: 500 GB (auto-scaling enabled)

5. **Availability & Durability**
   - **Multi-AZ deployment**: ✓ Enable (for high availability)
   - **Storage encryption**: ✓ Enable

6. **Network & Security**
   - **VPC**: Default VPC (or create new for better isolation)
   - **Subnet group**: Create new if needed
   - **Public accessibility**: NO (keep internal)
   - **VPC security group**: Create new → name: `myebizz-db-sg`

7. **Database Authentication**
   - **Database authentication**: PostgreSQL authentication

8. **Backup**
   - **Backup retention period**: 30 days
   - **Backup window**: 02:00-03:00 UTC
   - **Copy backups to another region**: YES (for disaster recovery)

9. **Monitoring**
   - **Enable CloudWatch logs**:
     - PostgreSQL log
     - Upgrade log
     - General log (optional)
   - **Retention**: 7 days

10. **Create Database**
    - Click "Create Database"
    - Wait 10-15 minutes for creation

### After Creation:

1. **Note the Endpoint**
   - RDS Console → Your DB instance
   - Copy: `myebizz-prod-db.<random>.us-east-1.rds.amazonaws.com`

2. **Configure Security Group**
   - Go to EC2 → Security Groups
   - Find `myebizz-db-sg`
   - Add inbound rule:
     - Type: PostgreSQL (5432)
     - Source: Your application security group (or 0.0.0.0/0 temporarily for testing)
     - Description: "Backend API access"

## Step 2.2: Create Databases & Users

### Connect to Database:
```bash
# Install PostgreSQL client
choco install postgresql

# Connect to database
psql -h myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com -U dbadmin -d postgres
# Enter password when prompted
```

### Create Application Database & User:
```sql
-- Create main database
CREATE DATABASE myebizz_prod;

-- Create application user with strong password
CREATE USER myebizz_app WITH PASSWORD 'AppUser#2026$Pass123!XyZ';

-- Grant privileges
GRANT CONNECT ON DATABASE myebizz_prod TO myebizz_app;
GRANT USAGE ON SCHEMA public TO myebizz_app;
GRANT CREATE ON SCHEMA public TO myebizz_app;

-- Connect to application database
\c myebizz_prod

-- Grant table privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myebizz_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myebizz_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO myebizz_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO myebizz_app;

-- Verify user
\du
\l
```

### Verify Connection:
```bash
psql -h myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com -U myebizz_app -d myebizz_prod
# Type password: AppUser#2026$Pass123!XyZ
# If successful, you'll see the psql prompt
```

## Step 2.3: Store Credentials in AWS Secrets Manager

### Create Secret:
1. Go to **Secrets Manager** console
2. Click "Store a new secret"
3. Configure:
   - **Secret type**: Other type of secret (Plaintext)
   - **Plaintext**:
   ```json
   {
     "host": "myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com",
     "port": 5432,
     "database": "myebizz_prod",
     "username": "myebizz_app",
     "password": "AppUser#2026$Pass123!XyZ"
   }
   ```
   - **Secret name**: `myebizz/prod/db`
   - Click "Store"

4. Note the **Secret ARN** - You'll use this in backend

---

# PHASE 3: BACKEND DEPLOYMENT (SPRING BOOT)

## Step 3.1: Prepare Spring Boot Application for Deployment

### 1. Update `application-prod.yml`
Update [backend-java/src/main/resources/application-prod.yml](backend-java/src/main/resources/application-prod.yml):

```yaml
spring:
  application:
    name: myebizz-api
  
  datasource:
    url: jdbc:postgresql://myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/myebizz_prod
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 20000
  
  jpa:
    hibernate:
      ddl-auto: validate  # Never use 'create' in production!
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
    show-sql: false
    properties:
      hibernate.format_sql: false
  
  jackson:
    default-timezone: UTC
    serialization:
      write-dates-as-timestamps: false

server:
  port: 8000
  servlet:
    context-path: /api
  compression:
    enabled: true
    min-response-size: 1024
  error:
    include-message: always

logging:
  level:
    root: INFO
    com.myebizz: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/myebizz-api.log
    max-size: 10MB
    max-history: 30

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
  metrics:
    export:
      cloudwatch:
        namespace: MyEbizz
        enabled: true

# Payment Configuration (from environment variables)
payment:
  stripe:
    secret-key: ${STRIPE_SECRET_KEY}
    publishable-key: ${STRIPE_PUBLISHABLE_KEY}
  razorpay:
    key-id: ${RAZORPAY_KEY_ID}
    key-secret: ${RAZORPAY_KEY_SECRET}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET}
  expiration: 900000  # 15 minutes
  refresh-expiration: 604800000  # 7 days

# Email Configuration
mail:
  smtp-server: ${SMTP_SERVER}
  smtp-port: ${SMTP_PORT}
  from-email: ${FROM_EMAIL}
  from-name: ${FROM_NAME}
  password: ${MAIL_PASSWORD}
```

### 2. Update `pom.xml` (if needed)
Ensure dependencies include:

```xml
<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>

<!-- AWS SDK for Secrets Manager -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>secretsmanager</artifactId>
    <version>2.24.0</version>
</dependency>

<!-- AWS SDK for CloudWatch -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>cloudwatch</artifactId>
    <version>2.24.0</version>
</dependency>
```

## Step 3.2: Build Docker Image for Spring Boot

### 1. Create Dockerfile in Backend Directory
Create [backend-java/Dockerfile](backend-java/Dockerfile) (if not exists):

```dockerfile
# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# Expose port
EXPOSE 8000

# Run application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

### 2. Build Docker Image Locally (for testing)
```bash
cd backend-java

# Build image
docker build -t myebizz-backend:latest .

# Test locally
docker run -p 8000:8000 \
  -e DB_USERNAME=myebizz_app \
  -e DB_PASSWORD=AppUser#2026$Pass123!XyZ \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/myebizz_prod \
  -e JWT_SECRET=your-secret-key-here \
  myebizz-backend:latest
```

## Step 3.3: Push Docker Image to AWS ECR

### 1. Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name myebizz/backend \
  --region us-east-1 \
  --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true
```

### 2. Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### 3. Tag and Push Image
```bash
# Tag image
docker tag myebizz-backend:latest \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/myebizz/backend:latest

docker tag myebizz-backend:latest \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/myebizz/backend:v1.0.0

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/myebizz/backend:latest
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/myebizz/backend:v1.0.0
```

## Step 3.4: Deploy Backend using ECS

### 1. Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name myebizz-prod \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

### 2. Create IAM Role for ECS Task
```bash
# Create trust policy
cat > ecs-task-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-trust.json

# Attach policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 3. Create CloudWatch Log Group
```bash
aws logs create-log-group --log-group-name /ecs/myebizz-backend
aws logs put-retention-policy --log-group-name /ecs/myebizz-backend --retention-in-days 30
```

### 4. Create ECS Task Definition
```bash
cat > ecs-task-definition.json << 'EOF'
{
  "family": "myebizz-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "myebizz-backend",
      "image": "YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/myebizz/backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "DB_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/db-xxxxx:username::"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/db-xxxxx:password::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/jwt-xxxxx:secret::"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/stripe-xxxxx:secret_key::"
        },
        {
          "name": "RAZORPAY_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/razorpay-xxxxx:key_id::"
        },
        {
          "name": "RAZORPAY_KEY_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:myebizz/prod/razorpay-xxxxx:key_secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/myebizz-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/ecsTaskExecutionRole"
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 5. Create Application Load Balancer (ALB)
```bash
# Create security group for ALB
aws ec2 create-security-group \
  --group-name myebizz-alb-sg \
  --description "Security group for MyEbizz ALB"

# Add inbound rules (allow HTTP and HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-name myebizz-alb-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name myebizz-alb-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create ALB
aws elbv2 create-load-balancer \
  --name myebizz-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Note the LoadBalancerArn
```

### 6. Create Target Group
```bash
aws elbv2 create-target-group \
  --name myebizz-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Note the TargetGroupArn
```

### 7. Create ALB Listener
```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:loadbalancer/app/myebizz-alb/xxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/myebizz-backend-tg/xxxxx
```

### 8. Create ECS Service
```bash
aws ecs create-service \
  --cluster myebizz-prod \
  --service-name myebizz-backend-service \
  --task-definition myebizz-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/myebizz-backend-tg/xxxxx,containerName=myebizz-backend,containerPort=8000 \
  --enable-ecs-managed-tags
```

### 9. Setup Auto Scaling
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/myebizz-prod/myebizz-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (CPU)
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/myebizz-prod/myebizz-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=60,ScaleInCooldown=300"
```

---

# PHASE 4: FRONTEND DEPLOYMENT (NEXT.JS)

## Option A: Deploy to Vercel (Recommended)

### Step 4A.1: Push Code to GitHub

```bash
cd d:\AMAR\GitHub\myebizz

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit: MyEbizz production ready"

# Add remote
git remote add origin https://github.com/your-username/myebizz.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4A.2: Deploy via Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Authorize Vercel

2. **Import Project**
   - Click "Add New" → Project
   - Select your GitHub repo: `your-username/myebizz`
   - Configure:
     - **Root Directory**: `.`
     - **Framework**: Next.js
     - **Node.js Version**: 20.x

3. **Environment Variables**
   - Add:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

---

## Option B: Deploy to AWS (S3 + CloudFront)

### Step 4B.1: Build Next.js Application

```bash
cd d:\AMAR\GitHub\myebizz

# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

### Step 4B.2: Create S3 Bucket for Frontend

```bash
# Create bucket
aws s3 mb s3://myebizz-frontend-prod --region us-east-1

# Enable static website hosting
aws s3 website s3://myebizz-frontend-prod \
  --index-document index.html \
  --error-document error.html

# Create bucket policy
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::myebizz-frontend-prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket myebizz-frontend-prod \
  --policy file://bucket-policy.json

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket myebizz-frontend-prod \
  --versioning-configuration Status=Enabled
```

### Step 4B.3: Upload Build to S3

```bash
# Build Next.js
npm run build

# Upload to S3
aws s3 sync ./out s3://myebizz-frontend-prod --delete --region us-east-1

# Or use AWS CLI with metadata
aws s3 sync ./out s3://myebizz-frontend-prod \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --region us-east-1

aws s3 sync ./out s3://myebizz-frontend-prod \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --region us-east-1
```

### Step 4B.4: Create CloudFront Distribution

```bash
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "myebizz-prod",
  "Comment": "MyEbizz Frontend Distribution",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "myebizz-frontend-prod.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      },
      "Headers": {
        "Quantity": 0
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 3600,
    "MaxTTL": 31536000
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/index.html",
      "TargetOriginId": "S3Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 0,
      "MaxTTL": 0
    }
  ]
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

---

# PHASE 5: DOMAIN, SSL & CDN

## Step 5.1: Register Domain (Route 53)

```bash
# Search for domain availability
aws route53domains check-domain-availability \
  --domain-name yourdomain.com \
  --tld-type com

# Register domain
aws route53domains register-domain \
  --domain-name yourdomain.com \
  --duration-in-years 1 \
  --admin-contact "FirstName=John,LastName=Doe,ContactType=PERSON,EmailAddress=admin@yourdomain.com,PhoneNumber=+1.2025551234,AddressLine1=123 Main St,City=Washington,State=DC,CountryCode=US,ZipCode=20001" \
  --registrant-contact "FirstName=John,LastName=Doe,ContactType=PERSON,EmailAddress=admin@yourdomain.com,PhoneNumber=+1.2025551234,AddressLine1=123 Main St,City=Washington,State=DC,CountryCode=US,ZipCode=20001" \
  --tech-contact "FirstName=John,LastName=Doe,ContactType=PERSON,EmailAddress=admin@yourdomain.com,PhoneNumber=+1.2025551234,AddressLine1=123 Main St,City=Washington,State=DC,CountryCode=US,ZipCode=20001"
```

## Step 5.2: Create Route 53 Hosted Zone

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference "$(date +%s)" \
  --hosted-zone-config Comment="MyEbizz Production"

# Note the HostedZoneId: Z1234567890ABC
```

## Step 5.3: Request SSL Certificate (ACM)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" "api.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1

# Note the CertificateArn
```

### Validate Certificate:
1. Go to **ACM Console**
2. Find your certificate
3. Click "Create records in Route 53"
4. Review and click "Create"
5. Wait for validation (usually 5-10 minutes)

## Step 5.4: Create Route 53 Records

```bash
# Get Hosted Zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name yourdomain.com \
  --query 'HostedZones[0].Id' \
  --output text)

# Create A record for main domain (points to CloudFront)
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "yourdomain.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d123456789abcd.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }
    ]
  }'

# Create A record for API subdomain (points to ALB)
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "api.yourdomain.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z35SXDOTRQ7X7K",
            "DNSName": "myebizz-alb-123456.us-east-1.elb.amazonaws.com",
            "EvaluateTargetHealth": true
          }
        }
      }
    ]
  }'
```

## Step 5.5: Update ALB with SSL Certificate

```bash
# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:loadbalancer/app/myebizz-alb/xxxxx \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/xxxxx \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/myebizz-backend-tg/xxxxx

# Redirect HTTP to HTTPS
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:listener/app/myebizz-alb/xxxxx/50dc6c495c30a191 \
  --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
```

---

# PHASE 6: ENVIRONMENT CONFIGURATION

## Step 6.1: Create Secrets in AWS Secrets Manager

```bash
# Database credentials
aws secretsmanager create-secret \
  --name myebizz/prod/db \
  --description "Database credentials" \
  --secret-string '{
    "host": "myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "myebizz_prod",
    "username": "myebizz_app",
    "password": "AppUser#2026$Pass123!XyZ"
  }'

# JWT Secret
aws secretsmanager create-secret \
  --name myebizz/prod/jwt \
  --description "JWT signing secret" \
  --secret-string '{
    "secret": "your-very-long-random-jwt-secret-at-least-32-characters-12345678901234"
  }'

# Stripe Keys
aws secretsmanager create-secret \
  --name myebizz/prod/stripe \
  --description "Stripe API credentials" \
  --secret-string '{
    "secret_key": "sk_live_xxxxxxxxxxxxxxxxxxxxx",
    "publishable_key": "pk_live_xxxxxxxxxxxxxxxxxxxxx"
  }'

# Razorpay Keys
aws secretsmanager create-secret \
  --name myebizz/prod/razorpay \
  --description "Razorpay API credentials" \
  --secret-string '{
    "key_id": "rzp_live_xxxxxxxxxxxxx",
    "key_secret": "xxxxxxxxxxxxxxxxxxxxxxxx"
  }'

# SMTP Configuration
aws secretsmanager create-secret \
  --name myebizz/prod/smtp \
  --description "Email SMTP configuration" \
  --secret-string '{
    "server": "smtp.gmail.com",
    "port": 587,
    "from_email": "noreply@yourdomain.com",
    "from_name": "MyEbizz",
    "password": "your-app-password"
  }'
```

## Step 6.2: Create Systems Manager Parameter Store for Non-Sensitive Config

```bash
# Frontend API URL
aws ssm put-parameter \
  --name /myebizz/prod/frontend-api-url \
  --value "https://api.yourdomain.com" \
  --type String

# Backend configuration
aws ssm put-parameter \
  --name /myebizz/prod/backend-port \
  --value "8000" \
  --type String
```

---

# PHASE 7: MONITORING & LOGGING

## Step 7.1: CloudWatch Dashboard

```bash
cat > dashboard-body.json << 'EOF'
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/ECS", "CPUUtilization", { "stat": "Average" } ],
          [ ".", "MemoryUtilization", { "stat": "Average" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Task Resource Usage"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/RDS", "DatabaseConnections" ],
          [ ".", "CPUUtilization" ],
          [ ".", "ReadLatency" ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "RDS Performance"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "TargetResponseTime" ],
          [ ".", "HTTPCode_Target_2XX_Count" ],
          [ ".", "HTTPCode_Target_5XX_Count" ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "ALB Metrics"
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --dashboard-name MyEbizz-Production \
  --dashboard-body file://dashboard-body.json
```

## Step 7.2: CloudWatch Alarms

```bash
# High CPU alert
aws cloudwatch put-metric-alarm \
  --alarm-name myebizz-high-cpu \
  --alarm-description "Alert when ECS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:myebizz-alerts

# High memory alert
aws cloudwatch put-metric-alarm \
  --alarm-name myebizz-high-memory \
  --alarm-description "Alert when ECS Memory > 85%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:myebizz-alerts

# Database connection pool alert
aws cloudwatch put-metric-alarm \
  --alarm-name myebizz-db-connections-high \
  --alarm-description "Alert when DB connections > 8" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 8 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:myebizz-alerts

# ALB 5XX errors
aws cloudwatch put-metric-alarm \
  --alarm-name myebizz-alb-5xx-errors \
  --alarm-description "Alert when ALB 5XX > 10" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:myebizz-alerts
```

## Step 7.3: CloudWatch Log Insights Queries

```bash
# Backend Error Logs
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count() by @logStream

# Slow Requests
fields @timestamp, @message, duration
| filter duration > 1000
| sort duration desc

# Payment Processing
fields @timestamp, @message
| filter @message like /payment|stripe|razorpay/i
| stats count() by payment_status
```

---

# PHASE 8: PAYMENT GATEWAY CONFIGURATION

## Step 8.1: Stripe Setup

### Get Live Keys:
1. Go to https://dashboard.stripe.com
2. Click Settings → API Keys
3. Copy:
   - **Secret Key**: `sk_live_xxxxxxxxxxxxx`
   - **Publishable Key**: `pk_live_xxxxxxxxxxxxx`

### Store in Secrets Manager:
```bash
aws secretsmanager update-secret \
  --secret-id myebizz/prod/stripe \
  --secret-string '{
    "secret_key": "sk_live_xxxxxxxxxxxxx",
    "publishable_key": "pk_live_xxxxxxxxxxxxx",
    "webhook_secret": "whsec_xxxxxxxxxxxxx"
  }'
```

### Configure Webhook:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add Endpoint"
3. Endpoint URL: `https://api.yourdomain.com/api/stores/{storeSlug}/payments/stripe/webhook`
4. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy Signing Secret: `whsec_xxxxxxxxxxxxx`

## Step 8.2: Razorpay Setup

### Get Live Keys:
1. Go to https://dashboard.razorpay.com
2. Settings → API Keys → Live
3. Copy:
   - **Key ID**: `rzp_live_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`

### Store in Secrets Manager:
```bash
aws secretsmanager update-secret \
  --secret-id myebizz/prod/razorpay \
  --secret-string '{
    "key_id": "rzp_live_xxxxxxxxxxxxx",
    "key_secret": "xxxxxxxxxxxxxxxxxxxxx"
  }'
```

---

# PHASE 9: EMAIL & NOTIFICATIONS

## Step 9.1: Setup Amazon SES (Simple Email Service)

```bash
# Verify sender email
aws ses verify-email-identity \
  --email-address noreply@yourdomain.com

# Move out of sandbox (request production access in AWS Console)
# Go to SES Console → Send Quota → Request Sending Quota

# Create SMTP credentials
# SES Console → SMTP Settings → Create My SMTP Credentials
```

## Step 9.2: Update Backend Email Configuration

```yaml
mail:
  smtp-server: email-smtp.us-east-1.amazonaws.com
  smtp-port: 587
  from-email: noreply@yourdomain.com
  from-name: MyEbizz
  password: ${MAIL_PASSWORD}  # From SES SMTP password
```

---

# PHASE 10: BACKUP & DISASTER RECOVERY

## Step 10.1: RDS Backup Strategy

```bash
# Automated backups are enabled (30 days retention)
# Check current backup settings
aws rds describe-db-instances \
  --db-instance-identifier myebizz-prod-db \
  --query 'DBInstances[0].{BackupRetentionPeriod,PreferredBackupWindow}'

# Update backup retention
aws rds modify-db-instance \
  --db-instance-identifier myebizz-prod-db \
  --backup-retention-period 30 \
  --preferred-backup-window "02:00-03:00" \
  --apply-immediately
```

## Step 10.2: Manual Database Snapshot

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier myebizz-prod-db \
  --db-snapshot-identifier myebizz-prod-db-snapshot-$(date +%Y%m%d-%H%M%S)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier myebizz-prod-db
```

## Step 10.3: Cross-Region Backup

```bash
# Copy snapshot to another region (for disaster recovery)
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:us-east-1:ACCOUNT:snapshot:myebizz-prod-db-snapshot-20260531 \
  --target-db-snapshot-identifier myebizz-prod-db-snapshot-20260531 \
  --region us-west-2
```

---

# PHASE 11: PERFORMANCE OPTIMIZATION

## Step 11.1: Enable Caching

### CloudFront Cache Settings (Already Configured):
- Static assets: 1 year TTL
- HTML pages: 0 seconds (no-cache)
- API responses: 1 hour TTL

### Backend HTTP Caching Headers:
```java
// Add to Spring Boot controllers
@GetMapping("/{storeSlug}/products")
public ResponseEntity<?> getProducts(
    @PathVariable String storeSlug,
    HttpServletResponse response) {
  
  // Cache static product lists for 1 hour
  response.setHeader("Cache-Control", "public, max-age=3600");
  response.setHeader("ETag", generateETag(products));
  
  return ResponseEntity.ok(products);
}
```

## Step 11.2: Database Query Optimization

### Enable Query Logging:
```bash
aws rds modify-db-cluster \
  --db-cluster-identifier myebizz-prod \
  --enable-cloudwatch-logs-exports postgresql \
  --apply-immediately
```

### PostgreSQL Query Analysis:
```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Create indexes for frequently accessed columns
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

## Step 11.3: ECS Task Optimization

```bash
# Monitor and adjust task resources based on CloudWatch metrics
aws ecs update-service \
  --cluster myebizz-prod \
  --service myebizz-backend-service \
  --task-definition myebizz-backend:2 \
  --force-new-deployment

# Check task memory/CPU usage
aws ecs describe-services \
  --cluster myebizz-prod \
  --services myebizz-backend-service
```

---

# PHASE 12: SECURITY HARDENING

## Step 12.1: WAF (Web Application Firewall)

```bash
# Create WAF ACL
aws wafv2 create-web-acl \
  --name myebizz-waf \
  --scope CLOUDFRONT \
  --default-action Block={} \
  --rules '[
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 0,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": {
        "None": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "CommonRuleSetMetric"
      }
    }
  ]' \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=myebizz-waf

# Attach WAF to CloudFront
aws cloudfront update-distribution \
  --id E123456789ABC \
  --distribution-config file://distribution-config-with-waf.json
```

## Step 12.2: Security Group Restrictions

```bash
# Backend: Only allow traffic from ALB and specific IPs
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 8000 \
  --source-group sg-alb-xxxxx \
  --description "Allow from ALB"

# Database: Only allow traffic from ECS tasks
aws ec2 authorize-security-group-ingress \
  --group-id sg-db-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ecs-xxxxx \
  --description "Allow from ECS"

# Remove any 0.0.0.0/0 rules in production
```

## Step 12.3: Enable VPC Encryption

```bash
# RDS encryption at rest (already enabled)
# RDS in-transit encryption
aws rds modify-db-instance \
  --db-instance-identifier myebizz-prod-db \
  --storage-encrypted \
  --apply-immediately
```

## Step 12.4: Secrets Rotation

```bash
# Enable automatic rotation for database password
aws secretsmanager rotate-secret \
  --secret-id myebizz/prod/db \
  --rotation-rules AutomaticallyAfterDays=30 \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:ACCOUNT:function:SecretsManager-Rotation
```

---

# DEPLOYMENT CHECKLIST

Before going live, verify:

## Pre-Deployment
- [ ] AWS Account created and IAM users configured
- [ ] RDS PostgreSQL database created with proper backups
- [ ] Database migrations run successfully
- [ ] Spring Boot Docker image built and pushed to ECR
- [ ] ECS cluster and service created with proper auto-scaling
- [ ] Application Load Balancer configured with target groups
- [ ] Next.js application built and deployed (Vercel or S3+CloudFront)
- [ ] Domain registered in Route 53
- [ ] SSL certificate issued and validated
- [ ] Route 53 DNS records configured

## Security
- [ ] All secrets stored in AWS Secrets Manager
- [ ] Security groups configured with least privilege
- [ ] WAF rules applied to CloudFront
- [ ] Database encryption enabled
- [ ] RDS automated backups enabled
- [ ] Cross-region backup configured

## Payment & Integration
- [ ] Stripe production keys configured
- [ ] Razorpay production keys configured
- [ ] Payment webhooks configured
- [ ] SES email service verified
- [ ] SMTP credentials configured

## Monitoring & Logging
- [ ] CloudWatch dashboards created
- [ ] CloudWatch alarms configured
- [ ] ECS task logging configured
- [ ] RDS enhanced monitoring enabled
- [ ] Application metrics being collected

## Testing
- [ ] Test user login (admin, super-admin, customer)
- [ ] Test product creation and management
- [ ] Test cart and checkout flow
- [ ] Test payment processing (Stripe and Razorpay)
- [ ] Test email notifications
- [ ] Test order creation and tracking
- [ ] Verify SSL certificate (no warnings)
- [ ] Test API endpoints with production URLs
- [ ] Load testing with expected traffic

## Performance
- [ ] CloudFront caching verified
- [ ] Database query performance checked
- [ ] ECS task resources optimized
- [ ] ALB response times acceptable
- [ ] Frontend page load time acceptable

## Post-Deployment
- [ ] Monitor CloudWatch dashboard for 24 hours
- [ ] Check application logs for errors
- [ ] Verify payment processing working
- [ ] Monitor database connections
- [ ] Test auto-scaling policies
- [ ] Document all configuration

---

# ROLLBACK PROCEDURE

If issues occur:

```bash
# 1. Rollback to previous ECS task definition
aws ecs update-service \
  --cluster myebizz-prod \
  --service myebizz-backend-service \
  --task-definition myebizz-backend:1 \
  --force-new-deployment

# 2. Rollback frontend (if using Vercel)
# Go to Vercel Dashboard → Deployments → Select previous version → Promote

# 3. Rollback frontend (if using S3)
aws s3 sync s3://myebizz-frontend-prod-backup/version-previous ./out
aws s3 sync ./out s3://myebizz-frontend-prod --delete

# 4. Rollback database (if critical issue)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier myebizz-prod-db-restored \
  --db-snapshot-identifier myebizz-prod-db-snapshot-20260530

# 5. Update Route 53 DNS if needed
```

---

# ESTIMATED AWS COSTS (Monthly)

| Service | Instance/Config | Est. Cost |
|---------|-----------------|-----------|
| **RDS** | db.t3.small, 100GB gp3 | $100-150 |
| **ECS Fargate** | 2 tasks × 0.5 CPU/1GB RAM | $200-250 |
| **Load Balancer** | 1 ALB | $20 |
| **CloudFront** | 1GB data transfer | $50-100 |
| **S3** | Frontend hosting | $5-10 |
| **Route 53** | 1 hosted zone | $0.50 |
| **CloudWatch** | Logs and metrics | $10-20 |
| **Secrets Manager** | API calls | $5-10 |
| **Data Transfer** | Outbound traffic | $50-200 |
| **TOTAL** | | **$440-740/month** |

---

# QUICK REFERENCE COMMANDS

```bash
# View deployed backend
curl https://api.yourdomain.com/api/health

# View frontend
https://yourdomain.com

# SSH into RDS (via bastion host or locally)
psql -h myebizz-prod-db.xxxxx.us-east-1.rds.amazonaws.com -U myebizz_app -d myebizz_prod

# View ECS logs
aws logs tail /ecs/myebizz-backend --follow

# Scale ECS service
aws ecs update-service \
  --cluster myebizz-prod \
  --service myebizz-backend-service \
  --desired-count 5

# Update ECS task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs update-service --cluster myebizz-prod --service myebizz-backend-service --task-definition myebizz-backend:2 --force-new-deployment
```

---

**Last Updated**: May 31, 2026  
**Version**: 1.0.0  
**Status**: Production Ready

--------------------------------------------

User: ## Role
Act as a senior full-stack engineer, DevOps engineer, and technical product architect. Analyze this entire repository and help me take the existing project from its current state to the **cheapest practical production MVP**.

Do not assume anything about the project. First inspect the actual repository, code, configuration, dependencies, scripts, environment variables, database setup, authentication, APIs, frontend, backend, storage, and deployment configuration.

## Phase 1 — Understand the project
Start by analyzing the complete project structure.

Report:

1. What this project does, based on the code.
2. Frontend technology and entry point.
3. Backend/API technology and entry point.
4. Database and ORM/query layer.
5. Authentication/authorization.
6. File/image/storage requirements.
7. External APIs/services.
8. Background jobs, cron jobs, queues, webhooks, workers, etc.
9. Build and development commands.
10. Production/start commands.
11. Required Node/Python/Java/etc. versions.
12. Package manager being used.
13. Existing deployment configuration.
14. Environment variables required.
15. Whether the project is monolithic or split into frontend/backend/services.
Do not merely describe folders. Trace the important application flows through the actual code.

## Phase 2 — Determine what is complete vs incomplete
Create a clear audit with these categories:

### ✅ Working / production-ready
Identify functionality that appears complete and explain why.

### 🟡 Partially implemented
Identify incomplete features, placeholders, TODOs, mocked data, temporary implementations, hardcoded values, unfinished UI, incomplete APIs, or missing error handling.

### 🔴 Missing / blocking production
Identify everything that would prevent the application from safely going live.

### 🧹 Nice-to-have
Identify things that are not required for an MVP and should NOT delay launch.

For every item, reference the relevant file(s) and explain what needs to change.

## Phase 3 — Define the MVP
Based on the existing code, determine the smallest useful version that can actually go live.

Give me:

- MVP features
- Features to postpone
- Features that can be removed
- Features that can be mocked temporarily
- Critical user journeys that must work
- Critical admin/operational functionality
- Security requirements that cannot be skipped
- Minimum monitoring/logging required
Do not recommend building unnecessary features just because they are common in similar products.

## Phase 4 — Production-readiness audit
Check the repository for:

- Secrets committed to Git
- `.env` files
- Missing `.env.example`
- Hardcoded API keys
- Hardcoded URLs
- CORS problems
- Authentication/security problems
- Missing input validation
- SQL/NoSQL injection risks
- XSS risks
- CSRF concerns where applicable
- Exposed admin functionality
- Debug mode
- Development-only dependencies/configuration
- Poor error handling
- Missing database migrations
- Database seed assumptions
- Local filesystem storage that will break in production
- Missing production environment variables
- Incorrect build scripts
- Incorrect production start scripts
- Port configuration
- HTTPS requirements
- Webhook configuration
- Cron/background-job requirements
- Rate limiting where appropriate
- Logging
- Backups
- Database connection configuration
- Dependency vulnerabilities
- Large/unnecessary files
- Generated files
- Build artifacts
- Secrets/configuration that should NOT be committed
Clearly separate **must fix before launch** from **can fix after MVP launch**.

## Phase 5 — GitHub repository audit
Tell me exactly what should be committed and pushed to GitHub.

Create three lists:

### MUST PUSH
Files/folders required for another developer or deployment platform to build and run the project.

### SHOULD NOT PUSH
Files that should be ignored, such as secrets, local environment files, dependencies, build output, caches, IDE files, logs, etc.

### CHECK BEFORE PUSHING
Files that may contain secrets, personal data, production credentials, large files, or machine-specific configuration.

Inspect the existing `.gitignore` and tell me what needs to be added or changed.

Also check whether Git history may already contain secrets.

## Phase 6 — Cheapest way to go live
Design the **lowest-cost architecture that is still sensible for an MVP**.

Consider options such as:

- One application instead of multiple services
- Managed/free-tier hosting
- Managed database
- Object storage only if necessary
- CDN/static hosting where appropriate
- Serverless vs traditional server
- Avoiding Kubernetes/microservices
- Avoiding unnecessary Redis/queues
- Avoiding paid infrastructure until actually needed
Compare realistic deployment options based on the technologies actually found in this repository.

For each option give:

OptionEstimated MVP costComplexityProsConsRecommendationIf free tiers are suitable, explain their limitations instead of assuming they are unlimited.

Then recommend **ONE architecture** as the default cheapest practical option.

## Phase 7 — Deployment architecture
Draw a simple architecture showing:

User
→ Domain/DNS
→ Frontend
→ Backend/API
→ Database
→ External services

Include any storage, queues, cron jobs, or third-party APIs only if this project actually needs them.

Explain why each component exists.

## Phase 8 — Exact deployment plan
Give me a step-by-step deployment sequence from the current repository to production.

Example structure:

1. Clean repository
2. Fix configuration
3. Create `.env.example`
4. Configure production environment variables
5. Set up database
6. Run migrations
7. Configure storage
8. Deploy application
9. Configure domain
10. Configure HTTPS
11. Configure webhooks
12. Configure background jobs
13. Run smoke tests
14. Verify logs
15. Verify authentication
16. Verify critical user flows
17. Launch
Adapt the steps to this actual repository.

For every step include:

- What I need to do
- Which file/command is involved
- Whether it is local or production
- What success looks like

## Phase 9 — Commands
Give me the exact commands I should run for:

- Installing dependencies
- Running locally
- Building
- Testing
- Linting
- Database setup
- Database migrations
- Seeding, if applicable
- Production build
- Git status
- Git diff
- Safe commit
- Push
- Deployment
Do not invent commands. Only provide commands supported by the project's actual configuration.

## Phase 10 — Environment variables
Find every environment variable referenced by the code.

Create a table:

VariableUsed byRequired?Example formatSecret?Production sourceDo NOT expose actual secret values.

Then tell me exactly which variables I need to configure before deployment.

## Phase 11 — Remaining work
Create a prioritized backlog:

### P0 — Must complete before MVP launch

### P1 — Should complete shortly after launch

### P2 — Future improvements
For every task include:

- Problem
- File(s)
- Required change
- Estimated difficulty: S/M/L
- Dependency/blocker
- Why it matters

## Phase 12 — MVP launch checklist
End with a practical launch checklist containing only things that are actually relevant to this repository.

Use:

- Repository cleaned
- Secrets removed
- `.env.example` created
- Production environment configured
- Database configured
- Migrations completed
- Build succeeds
- Production deployment succeeds
- Domain configured
- HTTPS working
- Authentication tested
- Critical user flow tested
- Error logging verified
- Backups configured where required
- Monitoring/basic health check verified
- MVP ready for users

## Important rules

1. **Inspect before recommending.**
2. Do not guess what the project uses.
3. Reference actual files when making claims.
4. Prefer the simplest architecture.
5. Optimize for the cheapest viable MVP, not theoretical scalability.
6. Do not recommend Kubernetes, microservices, Redis, queues, paid observability, or other infrastructure unless the code genuinely requires them.
7. Do not rewrite working code unnecessarily.
8. Clearly distinguish "required for launch" from "nice to have."
9. Never expose secrets or reproduce secret values.
10. If something cannot be determined from the repository, explicitly say **"Needs verification"** and tell me how to verify it.
11. Before suggesting deployment, verify that the project's actual build/start commands work conceptually from the repository configuration.
12. If there are multiple possible deployment approaches, recommend one and explain why.
13. Focus on getting to a usable **MVP quickly and cheaply**.

## Final output format
Return the analysis in this order:

1. **Project Summary**
2. **Technology Stack**
3. **Project Architecture**
4. **What Already Works**
5. **What Is Partially Complete**
6. **What Is Missing**
7. **MVP Definition**
8. **Production Blockers**
9. **GitHub Push Audit**
10. **Environment Variables**
11. **Cheapest Deployment Options**
12. **Recommended Architecture**
13. **Exact Deployment Steps**
14. **Commands**
15. **P0/P1/P2 Remaining Work**
16. **Final MVP Launch Checklist**
At the very end, give me a section called:

### "If I wanted to launch this as cheaply as possible this week"
Give me the **shortest realistic path from the current repository to a live MVP**, including what I should do first, second, third, etc.

Do not modify files yet. First perform the audit and give me the plan. After the audit, wait for my approval before making code changes.

GitHub Copilot: I'll scan the repository to locate key files, entry points, and configs. I'll run a thorough codebase search.

Search complete: Repo scan for frontend/backend entrypoints, configs, DB, auth, external services

Semantic workspace search is not currently available

Searched for files matching `**/*next.config*.{js,ts}`, 1 match

Searched for files matching `**/package.json`, 1 match

Searched for files matching `**/tsconfig.json`, 1 match

Searched for files matching `**/*pom.xml`, 1 match

Searched for files matching `**/Dockerfile`, 1 match

Searched for files matching `**/middleware.*{ts,js}`, 1 match

Searched for files matching `**/pages/**`, no matches

Searched for files matching `**/app/**`, 30 matches

Searched for regex `Spring Boot|pom.xml|backend.*Java|Dockerfile|production.*start|build.*script`, 32 results

Searched for regex `prisma|sequelize|knex|TypeORM|mongo|redis|stripe|razorpay|AWS|S3`, 844 results

Searched for regex `auth provider|database|API route|middleware`, 57 results

Read [](file:///d%3A/AMAR/GitHub/myebizz/next.config.ts)

Read [](file:///d%3A/AMAR/GitHub/myebizz/package.json)

Read [](file:///d%3A/AMAR/GitHub/myebizz/tsconfig.json)

Read [](file:///d%3A/AMAR/GitHub/myebizz/backend-java/pom.xml)

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/app/page.tsx)

Read [](file:///d%3A/AMAR/GitHub/myebizz/backend-java/Dockerfile)

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/middleware.ts)

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/app/api/auth/%5B...nextauth%5D/route.ts)

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/app/api/checkout/route.ts)

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/app/store/%5BstoreSlug%5D/checkout/page.tsx#1-1), lines 1 to 260

Next I'll search the repo for environment variable usages and gitignore files to list required env vars and check for committed secrets.

Searched for regex `process.env|DATABASE_URL|STRIPE_SECRET|RAZORPAY|NEXTAUTH_SECRET|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|RAZORPAY_KEY_ID|JWT_SECRET|sk_test|pk_test`, 573 results

I'll open .env.local to confirm any committed secrets and values.

Read [](file:///d%3A/AMAR/GitHub/myebizz/.env.local)

Now I'll open .gitignore to see what's being ignored.

Read [](file:///d%3A/AMAR/GitHub/myebizz/.gitignore)

I'll open client.ts to confirm how frontend calls the backend.

Read [](file:///d%3A/AMAR/GitHub/myebizz/src/lib/api/client.ts)

I'll create a short TODO plan tracking the audit, report, and deployment steps.

Created 5 todos

**Progress:** I scanned the repo (frontend + backend), opened key configs and confirmed a committed .env.local with secrets. Below is the full audit + plan.

**1. Project Summary**
- **What it is:** A storefront/e‑commerce monorepo for "MyEbizz" with a Next.js frontend (app router) and a Java Spring Boot backend providing payment endpoints, demo data, and auth. Frontend contains store, product, checkout flows and admin/super-admin layouts; backend contains payment/service/controllers and demo data.
- **Primary files:** package.json, next.config.ts, [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts), client.ts, pom.xml, Dockerfile, application-prod.yml.

**2. Technology Stack**
- **Frontend:** Next.js (app router), React 18, TypeScript, TailwindCSS, Zustand, NextAuth, Stripe & Razorpay frontend SDKs. Entry point: Next app at page.tsx. App-level middleware at middleware.ts.
- **Backend/API:** Spring Boot 3 (Java 17), Spring Web, Spring Data JPA, Stripe Java SDK, Razorpay Java SDK. Main class: BackendJavaApplication.java. Dockerfile: Dockerfile.
- **Database/ORM:** JPA / Hibernate (spring-boot-starter-data-jpa). Configured for PostgreSQL in prod and H2 runtime for dev. Connection string expected via `DATABASE_URL` in production config application-prod.yml.
- **Authentication:** Frontend uses `next-auth` with CredentialsProvider hitting backend login endpoint (`${NEXT_PUBLIC_API_URL}/auth/login`). It stores accessToken & refreshToken and supports Google OAuth when env vars present. Dev fallback to in-app `DEV_ACCOUNTS` when backend API is unavailable ([src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts)).
- **Storage/images:** Frontend uses remote images (Unsplash, Cloudinary, S3 patterns in next.config.ts). No production file upload storage found on backend controllers — uploader component exists but backend endpoints for persistent storage weren’t found in the repo.
- **External APIs/services:** Stripe (frontend & backend), Razorpay (frontend & backend), Google OAuth optional. Payment endpoints implemented in backend controllers: PaymentController.java and demo endpoints in PublicStoreController. Frontend API client base: client.ts.
- **Background jobs / queues:** None detected (no Redis/queue libraries, no scheduled jobs). Demo data services handle responses synchronously.
- **Build & dev commands:** Frontend: `npm run dev` (Next dev), `npm run build`, `npm start` (Next start) — package.json. Backend: Maven build (`mvn package`) (Dockerfile uses included `tools/apache-maven-3.9.9` for offline build) and runtime `java -jar /app/app.jar` (Dockerfile) or `mvn spring-boot:run`.
- **Production/start commands:** Frontend production: `next build` then `next start` (or deploy to Vercel). Backend production: Docker build or `mvn package` → `java -jar target/*.jar` (Dockerfile exposes port `8000`).
- **Node/Java versions:** Next.js 16 + React 18 require Node (not pinned). Backend uses Java 17 (pom property). TypeScript 5 in devDependencies. Package manager: npm (presence of package-lock.json).
- **Monolith vs split:** Monorepo with two distinct parts: Next.js frontend and Spring Boot backend. They can be deployed separately.

**3. Project Architecture (flow highlights)**
- User → Next.js frontend (`/store/[storeSlug]`, product pages, cart) → Checkout UI calls internal route `/api/checkout` (route.ts) → That handler calls backend payments/order APIs via `src/lib/api/*` which use `apiClient` (base from `NEXT_PUBLIC_API_URL`).
- Payments: Frontend uses Stripe (`StripePaymentForm`) and Razorpay components that call backend endpoints:
  - Create Intent: POST `/stores/{storeSlug}/payments/stripe/intent` → [backend controller / demo service].
  - Create Razorpay order: POST `/stores/{storeSlug}/payments/razorpay/order` → [backend controller / demo service].
- Auth: NextAuth Credentials provider posts to `${NEXT_PUBLIC_API_URL}/auth/login` and stores returned tokens; middleware (middleware.ts) protects admin routes using token role.

**4. What Already Works (✅ Working / production-ready)**
- **Frontend UI & routing:** Store, product, checkout, admin layouts, cart state via `zustand` — many UI pages render locally using mocks (e.g., [src/app/store/[storeSlug]/products/[productSlug]/page.tsx](src/app/store/[storeSlug]/products/[productSlug]/page.tsx)).
  - Evidence: multiple pages and components with client logic and mock data (e.g., MOCK_PRODUCT).
- **Client-side cart, checkout flow & validation:** Form validation via Zod, checkout front-end flow is implemented and posts to local API ([src/app/store/[storeSlug]/checkout/page.tsx](src/app/store/[storeSlug]/checkout/page.tsx); route.ts).
- **Payment integration stubs & working demo flows:** Frontend code integrates Stripe & Razorpay UI components; backend contains payment service/controller and demo endpoints — end‑to‑end flow can operate in demo mode (see PublicStoreController and PaymentService).
- **Auth fallback for local/demo:** NextAuth falls back to in-repo mock accounts if backend unavailable — enables local testing without backend ([src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts)).

**5. What Is Partially Implemented (🟡 Partially implemented)**
- **Persistent product/store data & admin CRUD:** Frontend shows admin UI scaffolding but many admin APIs are demo or missing store lookups (controller uses `Long storeId = 1L` placeholder, demo data service). Files: PaymentController.java and PublicStoreController. Needs real store lookup & CRUD.
- **File upload / media storage:** UI has `FileUploader.tsx` but I could not find backend storage endpoints or S3/Cloudinary upload controller — likely client-only or incomplete. Files: FileUploader.tsx (exists) — backend endpoints missing.
- **Auth full integration:** NextAuth stores tokens but backend JWT login endpoints and refresh endpoints exist in backend? There are DTOs and JWT config, but I did not verify a full `/auth/login` implementation matching frontend expectations — needs verification: see dto and application configs.
- **Migrations & DB seed:** Backend uses `spring.jpa.hibernate.ddl-auto=update` — that will auto-update schema but there are no explicit SQL migrations or seed scripts. Demo data service returns mock data rather than relying on DB (see `DemoDataService`).

**6. Missing / Blocking for Production (🔴 Must fix before launch)**
- **Committed secrets in repo:** .env.local is committed and contains `NEXTAUTH_SECRET` — immediate risk. File: .env.local. MUST remove and rotate secrets. Also .gitignore does not include .env.local (.gitignore).
- **Sensitive data in build artifacts:** .next and `target/` are present in repo (I saw .next artifacts and target), ensure build artifacts are not committed. Confirm via `git status`. (Needs verification: run `git ls-files`).
- **No `.env.example` or docs for all required env variables:** There is .env.local.example but a project-level `.env.example` should be present and complete. Confirmed .env.local.example exists but not comprehensive for backend. Provide consolidated example.
- **Storage for uploads is unspecified:** File uploads will break in production if admin tries to upload images (no S3/Cloudinary upload endpoint or credentials). Must provide or document image hosting approach or disable uploader for MVP.
- **Payments require live keys & webhooks:** Stripe webhooks and Razorpay secrets must be configured; webhook handling in backend is referenced but confirm presence of webhook endpoint. (Needs verification: search for webhook endpoints — I found references to `STRIPE_WEBHOOK_SECRET` in config; explicit webhook controller not found.)
- **CORS & origin settings:** next.config experimental serverActions allowedOrigins includes localhost only; backend CORS config not scanned — must ensure CORS configured for production domain. (Needs verification in backend codebase for `WebMvcConfigurer` or `@CrossOrigin`.)
- **No CI/CD config:** No deployment scripts/CI pipelines present for automated deploys.
- **No production monitoring/logging/backups:** Basic actuator is present ([application.yml]), but logging/alerts/backups not configured.

**7. Nice-to-have (🧹 Not required for MVP)**
- Multi-tenant billing/plans scaffold; analytics; advanced admin UX polish; scheduled tasks; Redis/queues; heavy observability integrations; advanced role management beyond `admin`/`super_admin`.

**8. MVP Definition**
- **MVP features (minimum):**
  - Public store browsing (demo store or DB-backed catalog).
  - Product pages + cart.
  - Checkout with one payment provider enabled (recommend Razorpay for India or Stripe for global), with demonstration flow.
  - User sign-in (credentials) via NextAuth backed by backend when available, otherwise demo credentials.
  - Order creation endpoint that persists minimal order records (or returns demo order in DB-less mode).
  - Admin login + ability to view orders (basic).
- **Postpone / remove:**
  - Multi-store admin features, advanced reporting, multi-currency, subscription billing.
  - File upload persistence for MVP (use Cloudinary or disable uploader and use remote URLs).
- **Can be mocked temporarily:**
  - Product & store data (use demo data service or hard-coded JSON).
  - Order persistence (start with demo service until DB seeded).
- **Critical user journeys:**
  - Browse store → add to cart → checkout → payment success → order confirmation page.
  - Admin login → view orders.
- **Critical admin ops:**
  - Admin authentication and order retrieval.
- **Security requirements (cannot skip):**
  - Remove committed secrets and rotate keys.
  - Use HTTPS in production.
  - Ensure JWT secrets are set and strong (`JWT_SECRET`, `NEXTAUTH_SECRET`).
  - Validate inputs server-side (controllers mostly use `@Valid`).
- **Minimum monitoring/logging:** Enable Spring Actuator endpoints for health/info, Next.js basic error logging; attach platform logs (Render/Vercel).

**9. Production Blockers (must fix before launch)**
- Remove committed .env.local from repo and rotate secrets (MUST).
- Add .env.local to .gitignore and add a complete `.env.example`.
- Verify backend `/auth/login` and token refresh endpoints exist and match frontend expectations (Needs verification).
- Provide or document image storage or disable uploader.
- Configure production DB (Postgres) and ensure migrations or `ddl-auto` policy is acceptable.
- Configure Stripe/Razorpay live keys and webhook endpoint (verify webhook handling present).

**10. GitHub Push Audit**
- **MUST PUSH**
  - Source code (frontend src, backend src), package.json, tsconfig.json, pom.xml, Dockerfile, docs (`README`, guides) — everything needed to build/run.
- **SHOULD NOT PUSH**
  - Secrets & env files: .env.local (remove from repo history).
  - Build artifacts & caches: .next, target, node_modules.
- **CHECK BEFORE PUSHING**
  - package-lock.json (ok), but ensure no secrets in lockfile.
  - `backend-java/target/classes/application*.yml` — contains substituted values; verify no secrets.
  - Postman collections that contain real credentials: Myebizz-Backend.postman_collection.json — check for secrets before pushing.
- **.gitignore changes required**
  - Add .env.local to .gitignore.
  - Ensure target is ignored.
  - Ensure `.env.*` patterns are ignored (e.g., `.env*` if desirable, but keep `.env.example`).

**11. Environment Variables (collected from code & configs)**
Variable | Used by | Required? | Example format | Secret? | Production source
- **NEXTAUTH_URL** | NextAuth | yes (for provider redirect) | http://localhost:3000 | no | Vercel/Env
- **NEXTAUTH_SECRET** | NextAuth middleware | yes | long-random-string | yes | Vercel/Env
- **NEXT_PUBLIC_API_URL** | Frontend API client | yes (to reach backend) | https://api.example.com/api | no | Vercel/Env
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET** | GoogleProvider | optional | <id> / <secret> | yes | Vercel/Env
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** | Stripe front-end | required if Stripe used | pk_live_... | no (public) | Vercel/Env
- **STRIPE_SECRET_KEY** | Backend Stripe SDK | required for live payments | sk_live_... | yes | Backend env
- **STRIPE_WEBHOOK_SECRET** | Stripe webhook verification | required if webhooks used | whsec_... | yes | Backend env
- **NEXT_PUBLIC_RAZORPAY_KEY_ID** | Razorpay frontend | required if Razorpay used | rzp_live_... | no (public) | Vercel/Env
- **RAZORPAY_KEY_SECRET** | Razorpay backend | required | secret | yes | Backend env
- **DATABASE_URL** | Backend DB connection | required for PostgreSQL prod | postgres://user:pass@host:5432/db | yes | Backend env
- **JWT_SECRET** | Backend JWTs | required | long-random-string | yes | Backend env
- **SPRING_PROFILES_ACTIVE** | Backend profile | optional (set to `prod`) | prod | no | Backend env
- **ANY OTHER**: `VERCEL`/platform-specific var; inspect full env usage if enabling additional features.

Do NOT commit values. Before deployment, at minimum configure: `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `JWT_SECRET`, `STRIPE_*` (or `RAZORPAY_*`) depending on chosen payment.

**12. Cheapest Deployment Options (summary)**

Options compared (cost estimate / complexity / recommendation):

1) Vercel (Frontend) + Render or Railway (Backend + Postgres managed)
- Estimated monthly MVP cost: $0–$12 (Vercel free hobby + Render/Railway free tier; Postgres may have low-cost tiers)
- Complexity: Low — Next.js first-class on Vercel; backend can run as Docker service on Render.
- Pros: Fast setup, free tiers, certificate provisioning, automatic builds.
- Cons: Free tiers have resource/time limits; may need paid database for persistence.
- Recommendation: Good default for lowest friction.

2) Vercel (Frontend) + DigitalOcean App / $5 droplet (Backend + Postgres on Managed DB)
- Estimated monthly MVP cost: $5–$15 (droplet) + $15+ for managed Postgres.
- Complexity: Medium (manual infra).
- Pros: Lower predictable cost for small scale.
- Cons: More ops work.

3) Single server Docker (one VM) hosting both Next.js (as static) and Java backend
- Estimated: $5–10/month (small VPS)
- Complexity: Medium-high (ops).
- Pros: Cheapest raw cost if you can operate it.
- Cons: Less reliable than managed services; must manage SSL, backups.

If free tiers suitable: Vercel + Render/Railway is preferred — limits: ephemeral free DBs, quotas, and cold-starts.

**Recommendation (ONE architecture):**
- Frontend: Deploy to Vercel (native Next.js support, free tier).
- Backend: Deploy Spring Boot as Docker service on Render or Railway using Dockerfile.
- Database: Managed PostgreSQL (Render or Railway managed DB). If free Postgres not acceptable, use Hobby tier.
- Storage: Use Cloudinary for images (free tier) or keep images external (Unsplash) — avoid S3 until needed.

**13. Deployment Architecture (simple)**
- User → DNS → Vercel (Next.js, CDN, static assets) → Backend API (Render service on HTTPS) → Managed Postgres DB (Render/Railway) → Stripe/Razorpay external APIs
- Why each exists:
  - Vercel: fast & free Next.js deployment and CDN.
  - Backend on Render: runs Java jar/docker, easy environment configuration.
  - Managed Postgres: production data persistence without ops.
  - Cloudinary (optional): store images cheaply and avoid S3 complexity.
  - Stripe/Razorpay: payment processing.

**14. Exact Deployment Steps (adapted to this repo)**
1. Clean repo (local)
   - What: Remove secrets and build artifacts.
   - Files/commands:
     - Remove .env.local from repo and add to .gitignore.
       - Local:
         git rm --cached .env.local
         echo ".env.local" >> .gitignore
       - Success: .env.local no longer tracked; .gitignore contains .env.local.
   - Why local: must not push secrets.

2. Rotate any exposed secrets
   - What: Replace any rotated NEXTAUTH_SECRET / API keys (if already leaked).
   - Where: Platform provider consoles (Stripe/Razorpay).

3. Create a complete `.env.example`
   - What: Add all variables listed above with placeholder values.
   - File: create ` .env.example` at repo root.
   - Success: Developers know needed vars.

4. Configure production environment on chosen hosts
   - Vercel (Frontend):
     - Set `NEXT_PUBLIC_API_URL` to backend URL, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in Vercel env.
     - Connect GitHub repo, enable build (Vercel auto).
   - Render/Railway (Backend):
     - Create a Docker service, set env vars: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `SPRING_PROFILES_ACTIVE=prod`.
     - Attach managed Postgres service and set `DATABASE_URL`.
   - Success: Services show "Healthy" and build logs succeed.

5. Database
   - What: Provision Postgres; set `DATABASE_URL`.
   - Commands: none (managed).
   - Schema: JPA `ddl-auto=update` will create basic schema; for production prefer proper migrations (Flyway) later.
   - Success: Application connects and can persist data.

6. Build and deploy
   - Frontend (Vercel): push to main; Vercel runs build `npm run build`.
   - Backend (Render): Build Docker via Dockerfile or use `mvn package` then run jar; Render will use Dockerfile.
   - Success: Both services online; frontend calls backend API.

7. Configure payment providers
   - Set Stripe &/or Razorpay live keys in platform env.
   - Configure Stripe webhook endpoint (if using Stripe) and set `STRIPE_WEBHOOK_SECRET`.
   - Success: Payments processed and verified end-to-end.

8. Smoke tests
   - Local or production:
     - Browse store → add item → checkout → pay in test mode → confirm order success.
     - Admin login with demo or real account → view orders.
   - Success: Critical user journeys pass.

9. Logging & health
   - Ensure Spring Actuator endpoints enabled on prod for `/actuator/health` (configured in application.yml).
   - Verify Vercel/Render logs accessible.

**15. Exact Commands**
- Frontend dependencies:
  - npm install
- Frontend run locally:
  - npm run dev
- Frontend build:
  - npm run build
- Frontend start (production):
  - npm start
- Lint:
  - npm run lint
- Backend (from repo root):
  - cd backend-java
  - Use included Maven wrapper: tools/apache-maven-3.9.9/bin/mvn package -DskipTests
  - Run jar: java -jar target/*.jar
- Docker (backend):
  - docker build -t myebizz-backend ./backend-java
  - docker run -p 8000:8000 -e DATABASE_URL=... -e STRIPE_SECRET_KEY=... myebizz-backend
- Git safe commit (example):
  - git status
  - git add .
  - git commit -m "Prepare repo for production: remove secrets, add .env.example"
  - git push origin main
- Verify git history for secrets (local check):
  - git log -- .env.local
  - If secrets were previously committed: use `git filter-repo` or BFG to remove, then rotate secrets.

**16. Remaining Work / Backlog**
P0 — Must complete before MVP
- Remove .env.local from repo & rotate secrets. Files: .env.local, .gitignore. Difficulty: S (urgent).
- Add `.env.example` and docs with required env vars. Files: root `.env.example`. Difficulty: S.
- Configure production envs on chosen hosts (Vercel + Render/Railway). Difficulty: S.
- Confirm backend `/auth/login` & refresh endpoints match frontend expectations; implement if missing. Files: backend controllers & DTOs. Difficulty: M.
- Disable or implement file upload persistence (choose Cloudinary). Files: uploader + backend routes. Difficulty: M.

P1 — Should complete shortly after launch
- Implement database migrations (Flyway/Liquibase) instead of `ddl-auto=update`. Files: backend pom.xml + migration scripts. Difficulty: M.
- Add webhook endpoints & test for Stripe webhooks (verify signature). Files: backend webhook controller. Difficulty: M.
- Implement admin CRUD endpoints for products/stores. Difficulty: L.

P2 — Future improvements
- Add CI/CD pipelines (GitHub Actions), automated tests, observability (Sentry), backups. Difficulty: M-L.

**17. Final MVP Launch Checklist**
- Repository cleaned (no secrets, no build artifacts committed)
- Secrets removed and rotated
- `.env.example` created and documented
- Production environment configured (Vercel + Render/Railway)
- Database provisioned (Postgres)
- Backend connected to DB; `SPRING_PROFILES_ACTIVE=prod` set
- Build succeeds (frontend & backend)
- Payments test keys configured; webhook verified
- HTTPS enabled (platforms provide certs)
- Authentication (NextAuth) tested
- Critical flows tested: browse → checkout → payment → order success
- Logging & health (actuator) verified
- Basic backup plan for DB

### Security / Immediate Action Items (critical)
- Delete .env.local from Git and add to .gitignore (then rotate `NEXTAUTH_SECRET` and any other leaked keys).
  - Commands:
    - git rm --cached .env.local
    - echo ".env.local" >> .gitignore
    - git commit -m "Remove local env and ignore"
    - git push
- Verify git history for secret leaks (use BFG/git filter-repo) and rotate any exposed keys.

### If I wanted to launch this as cheaply as possible this week
1. Remove .env.local from repo and rotate secrets now (local).
2. Deploy frontend to Vercel (free):
   - Connect repo; set environment variables: `NEXT_PUBLIC_API_URL` (temporary to backend test URL), `NEXTAUTH_SECRET`.
3. Deploy backend to Render/Railway using Dockerfile (free tier).
   - Provision managed Postgres on same platform (free/trial).
   - Set env: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`/`RAZORPAY_KEY_SECRET`, `SPRING_PROFILES_ACTIVE=prod`.
4. Use test Stripe/Razorpay keys to verify payment flows.
5. Test critical flows and iterate on missing small backend endpoints if needed.
6. Keep product catalog in demo mode (no DB) for immediate launch if DB setup becomes blocker — frontend supports demo fallbacks.

Notes / Needs verification
- Confirm presence/behavior of `/auth/login` and `/auth/refresh` backend endpoints and webhook controller; I saw DTOs and JWT config but not full login implementation — please confirm by running backend or pointing me to specific controller files if I missed them.
- Confirm any secrets in Git history beyond .env.local (run `git log --all --grep=<secret>` locally or use a secret-scan tool).

---

If you want, I can:
- Produce a precise `.env.example` file listing all required env vars.
- Create a safe commit script and patch .gitignore and remove .env.local from index (I will not modify repo until you approve).
Which action would you like me to do next?