# 4 Paws - AWS Staging Deployment Guide

This guide covers deploying the 4 Paws backend to AWS for staging/testing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Staging Environment                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Application Load Balancer (ALB)                     │   │
│  │  - Public endpoint for mobile app                    │   │
│  │  - SSL/TLS termination                               │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  ECS Fargate Cluster                                 │   │
│  │  - 4 Paws Backend Container                          │   │
│  │  - Auto-scaling (1-3 tasks)                          │   │
│  │  - CloudWatch logs                                   │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  RDS PostgreSQL (Multi-AZ)                           │   │
│  │  - Managed database                                  │   │
│  │  - Automated backups                                 │   │
│  │  - Point-in-time recovery                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  S3 Bucket                                           │   │
│  │  - User uploads storage                              │   │
│  │  - CloudFront CDN integration                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Secrets Manager                                     │   │
│  │  - Database credentials                              │   │
│  │  - API keys                                          │   │
│  │  - OAuth tokens                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally (for testing)
4. **Git** repository for the 4 Paws project
5. **Domain name** (optional, for custom domain)

## Step 1: Prepare AWS Account

### Create IAM User for Deployment

```bash
# Create IAM user with programmatic access
aws iam create-user --user-name 4paws-deployer

# Attach necessary policies
aws iam attach-user-policy --user-name 4paws-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-user-policy --user-name 4paws-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-user-policy --user-name 4paws-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-user-policy --user-name 4paws-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy --user-name 4paws-deployer \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

# Create access keys
aws iam create-access-key --user-name 4paws-deployer
```

Save the Access Key ID and Secret Access Key securely.

## Step 2: Set Up ECR (Elastic Container Registry)

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name 4paws-backend \
  --region us-east-1

# Get login token and push Docker image
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push Docker image
docker build -t 4paws-backend:latest .

docker tag 4paws-backend:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest

docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest
```

## Step 3: Create RDS Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier 4paws-staging-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp2 \
  --multi-az \
  --publicly-accessible false \
  --backup-retention-period 7 \
  --region us-east-1

# Wait for database to be available
aws rds wait db-instance-available \
  --db-instance-identifier 4paws-staging-db
```

## Step 4: Create VPC and Security Groups

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --query 'Vpc.VpcId' --output text)

# Create subnets
SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 --availability-zone us-east-1a \
  --query 'Subnet.SubnetId' --output text)

SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 --availability-zone us-east-1b \
  --query 'Subnet.SubnetId' --output text)

# Create security group for ALB
ALB_SG=$(aws ec2 create-security-group \
  --group-name 4paws-alb-sg \
  --description "Security group for 4 Paws ALB" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow HTTP and HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Create security group for ECS
ECS_SG=$(aws ec2 create-security-group \
  --group-name 4paws-ecs-sg \
  --description "Security group for 4 Paws ECS" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow traffic from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp --port 3000 \
  --source-group $ALB_SG
```

## Step 5: Create ECS Cluster and Task Definition

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name 4paws-staging

# Create CloudWatch log group
aws logs create-log-group --log-group-name /ecs/4paws-backend

# Register task definition (see task-definition.json below)
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### task-definition.json

```json
{
  "family": "4paws-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "4paws-backend",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:4paws/db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:4paws/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/4paws-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskRole"
}
```

## Step 6: Create Application Load Balancer

```bash
# Create ALB
ALB=$(aws elbv2 create-load-balancer \
  --name 4paws-alb \
  --subnets $SUBNET_1 $SUBNET_2 \
  --security-groups $ALB_SG \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Create target group
TG=$(aws elbv2 create-target-group \
  --name 4paws-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG
```

## Step 7: Create ECS Service

```bash
# Create ECS service
aws ecs create-service \
  --cluster 4paws-staging \
  --service-name 4paws-backend-service \
  --task-definition 4paws-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=$TG,containerName=4paws-backend,containerPort=3000 \
  --deployment-configuration maximumPercent=200,minimumHealthyPercent=100
```

## Step 8: Configure Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/4paws-staging/4paws-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 3

# Create scaling policy (scale up on high CPU)
aws application-autoscaling put-scaling-policy \
  --policy-name 4paws-scale-up \
  --service-namespace ecs \
  --resource-id service/4paws-staging/4paws-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=60,ScaleInCooldown=300"
```

## Step 9: Store Secrets in AWS Secrets Manager

```bash
# Store database URL
aws secretsmanager create-secret \
  --name 4paws/db-url \
  --secret-string "postgresql://admin:PASSWORD@4paws-staging-db.xxxxx.us-east-1.rds.amazonaws.com:5432/4paws"

# Store JWT secret
aws secretsmanager create-secret \
  --name 4paws/jwt-secret \
  --secret-string "$(openssl rand -base64 32)"

# Store Stripe keys (if using Stripe)
aws secretsmanager create-secret \
  --name 4paws/stripe-key \
  --secret-string "sk_test_xxxxx"
```

## Step 10: Run Database Migrations

```bash
# Connect to RDS and run migrations
# Option 1: Use AWS Systems Manager Session Manager
aws ssm start-session --target <ECS_TASK_ID>

# Inside the container:
pnpm db:push

# Option 2: Use a one-off task
aws ecs run-task \
  --cluster 4paws-staging \
  --task-definition 4paws-backend:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1],securityGroups=[$ECS_SG]}" \
  --overrides '{"containerOverrides":[{"name":"4paws-backend","command":["pnpm","db:push"]}]}'
```

## Step 11: Configure Mobile App to Use Staging Backend

Update the mobile app's API endpoint to point to the staging backend:

### In `lib/trpc.ts`:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const trpc = createTRPCReact<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          // ... rest of config
        }),
      ],
    };
  },
});
```

### In `.env.staging`:

```
EXPO_PUBLIC_API_URL=https://4paws-staging.example.com
```

### Build staging APK:

```bash
# For development/staging
eas build --platform android --profile staging

# For production
eas build --platform android --profile production
```

## Step 12: Set Up CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml` for automatic deployments:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push Docker image
        run: |
          aws ecr get-login-password --region us-east-1 | docker login \
            --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
          
          docker build -t 4paws-backend:${{ github.sha }} .
          docker tag 4paws-backend:${{ github.sha }} \
            ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster 4paws-staging \
            --service 4paws-backend-service \
            --force-new-deployment
```

## Monitoring and Logs

```bash
# View CloudWatch logs
aws logs tail /ecs/4paws-backend --follow

# Check ECS service status
aws ecs describe-services \
  --cluster 4paws-staging \
  --services 4paws-backend-service

# View ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/4paws-alb/xxxxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average,Maximum
```

## Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|-----------------|
| ECS Fargate | 256 CPU, 512 MB | $15-20 |
| RDS PostgreSQL | db.t3.micro | $15-20 |
| ALB | 1 ALB | $16 |
| Data Transfer | 100 GB | $10-15 |
| **Total** | | **$56-71** |

## Troubleshooting

### Tasks failing to start
```bash
aws ecs describe-task-definition --task-definition 4paws-backend:1
aws ecs describe-tasks --cluster 4paws-staging --tasks <TASK_ID>
```

### Database connection issues
```bash
# Test RDS connectivity
psql -h 4paws-staging-db.xxxxx.us-east-1.rds.amazonaws.com \
  -U admin -d 4paws
```

### ALB health checks failing
```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn $TG
```

## Next Steps

1. **Set up custom domain** — Use Route 53 to point your domain to the ALB
2. **Enable HTTPS** — Use AWS Certificate Manager for SSL/TLS
3. **Set up monitoring** — Configure CloudWatch alarms for CPU, memory, errors
4. **Enable auto-scaling** — Configure based on your traffic patterns
5. **Set up backups** — Configure automated RDS backups and snapshots
6. **Configure CDN** — Use CloudFront for static assets
7. **Set up CI/CD** — Automate deployments on git push

## Support

For AWS-specific questions, refer to:
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
