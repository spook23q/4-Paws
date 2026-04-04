# 4 Paws Staging Deployment Checklist

## Pre-Deployment (Before AWS Setup)

- [ ] Review `DEPLOYMENT_AWS.md` for complete AWS setup guide
- [ ] Ensure all code is committed to git
- [ ] Run `pnpm test` to verify all tests pass
- [ ] Run `pnpm build` to verify production build works
- [ ] Update version number in `package.json` and `app.config.ts`
- [ ] Create a git tag: `git tag -a v1.0.0-staging -m "Staging deployment"`

## AWS Infrastructure Setup

### Account & IAM

- [ ] Create AWS account or use existing account
- [ ] Create IAM user `4paws-deployer` with appropriate permissions
- [ ] Save AWS Access Key ID and Secret Access Key securely
- [ ] Configure AWS CLI: `aws configure`

### ECR (Docker Registry)

- [ ] Create ECR repository: `4paws-backend`
- [ ] Build Docker image: `docker build -t 4paws-backend:latest .`
- [ ] Push to ECR: `docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/4paws-backend:latest`

### Database (RDS)

- [ ] Create RDS PostgreSQL instance (`db.t3.micro`)
- [ ] Enable Multi-AZ for high availability
- [ ] Set strong master password
- [ ] Wait for database to be available
- [ ] Note the database endpoint URL

### Networking (VPC)

- [ ] Create VPC with CIDR block `10.0.0.0/16`
- [ ] Create 2 subnets in different availability zones
- [ ] Create security groups for ALB and ECS
- [ ] Configure security group ingress rules

### Load Balancer (ALB)

- [ ] Create Application Load Balancer
- [ ] Create target group for backend service
- [ ] Create listener on port 80 (HTTP)
- [ ] Note the ALB DNS name

### Container Orchestration (ECS)

- [ ] Create ECS cluster: `4paws-staging`
- [ ] Create CloudWatch log group: `/ecs/4paws-backend`
- [ ] Register task definition with correct image URI
- [ ] Create ECS service with 2 tasks
- [ ] Configure auto-scaling (1-3 tasks)

### Secrets Management

- [ ] Store database URL in Secrets Manager
- [ ] Store JWT secret in Secrets Manager
- [ ] Store Stripe keys in Secrets Manager
- [ ] Store OAuth credentials in Secrets Manager
- [ ] Grant ECS task role access to secrets

## Backend Configuration

- [ ] Copy `.env.staging` to `.env.production`
- [ ] Update all placeholder values:
  - [ ] `DATABASE_URL` - RDS endpoint
  - [ ] `STRIPE_SECRET_KEY` - Stripe test key
  - [ ] `AWS_ACCESS_KEY_ID` - AWS credentials
  - [ ] `AWS_SECRET_ACCESS_KEY` - AWS credentials
  - [ ] `S3_BUCKET` - S3 bucket name
  - [ ] `EXPO_ACCESS_TOKEN` - Expo token
- [ ] Run database migrations: `pnpm db:push`
- [ ] Verify API health check: `curl https://4paws-staging.example.com/health`

## Mobile App Configuration

- [ ] Update `EXPO_PUBLIC_API_URL` in `.env.staging`
- [ ] Update `app.config.ts` with staging API endpoint
- [ ] Build staging APK: `eas build --platform android --profile staging`
- [ ] Build staging iOS app: `eas build --platform ios --profile staging`

### iOS TestFlight Setup

- [ ] Create Apple Developer account (if not already)
- [ ] Create App ID for 4 Paws
- [ ] Create provisioning profiles
- [ ] Upload staging build to TestFlight
- [ ] Invite testers via TestFlight
- [ ] Verify testers can install and run app

### Android Play Store Internal Testing

- [ ] Create Google Play Developer account (if not already)
- [ ] Create app listing for 4 Paws
- [ ] Create internal testing track
- [ ] Upload staging APK to internal testing track
- [ ] Invite testers via Play Store
- [ ] Verify testers can install and run app

## Testing & Verification

### Backend Testing

- [ ] Test API health endpoint
- [ ] Test authentication flow (sign up, sign in, logout)
- [ ] Test booking creation and management
- [ ] Test messaging system
- [ ] Test payment processing (use Stripe test cards)
- [ ] Test notifications
- [ ] Test file uploads to S3
- [ ] Check CloudWatch logs for errors

### Mobile App Testing

- [ ] Test app installation from TestFlight/Play Store
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test search and filter functionality
- [ ] Test booking creation
- [ ] Test messaging
- [ ] Test payment flow (use Stripe test cards)
- [ ] Test notifications
- [ ] Test on both iOS and Android devices
- [ ] Test on different network conditions (WiFi, 4G, 3G)
- [ ] Test app performance and battery usage

### End-to-End Testing

- [ ] Owner creates account and adds cats
- [ ] Owner searches for sitters
- [ ] Owner creates booking request
- [ ] Sitter receives notification
- [ ] Sitter accepts booking
- [ ] Owner receives confirmation notification
- [ ] Owner and sitter exchange messages
- [ ] Owner makes payment
- [ ] Booking completion and review flow
- [ ] Verify all notifications are received

## Monitoring & Logging

- [ ] Set up CloudWatch dashboards
- [ ] Create CloudWatch alarms for:
  - [ ] High CPU usage (> 80%)
  - [ ] High memory usage (> 80%)
  - [ ] Task failures
  - [ ] API errors (5xx)
  - [ ] Database connection errors
- [ ] Configure log retention (30 days)
- [ ] Set up SNS notifications for alarms

## Documentation

- [ ] Document staging API endpoint URL
- [ ] Document staging database credentials (in secure location)
- [ ] Document AWS resource IDs and ARNs
- [ ] Create runbook for common operations:
  - [ ] How to restart services
  - [ ] How to view logs
  - [ ] How to scale up/down
  - [ ] How to rollback deployment
- [ ] Document known issues and workarounds

## Post-Deployment

- [ ] Announce staging environment to testers
- [ ] Collect feedback from testers
- [ ] Monitor error logs and metrics
- [ ] Fix bugs and issues found during testing
- [ ] Prepare for production deployment
- [ ] Schedule post-deployment review meeting

## Rollback Plan

If issues occur:

1. [ ] Identify the problem from CloudWatch logs
2. [ ] Revert to previous Docker image:
   ```bash
   aws ecs update-service \
     --cluster 4paws-staging \
     --service 4paws-backend-service \
     --force-new-deployment
   ```
3. [ ] Check service status: `aws ecs describe-services --cluster 4paws-staging --services 4paws-backend-service`
4. [ ] Verify API is responding
5. [ ] Notify testers of the rollback

## Cost Monitoring

- [ ] Set up AWS Billing alerts
- [ ] Monitor daily costs
- [ ] Optimize resources if costs are higher than expected
- [ ] Review and optimize after 1 week of operation

## Sign-Off

- [ ] QA team approves staging deployment
- [ ] Product manager approves staging deployment
- [ ] Ready for production deployment

---

## Quick Commands Reference

```bash
# View logs
aws logs tail /ecs/4paws-backend --follow

# Check service status
aws ecs describe-services --cluster 4paws-staging --services 4paws-backend-service

# View running tasks
aws ecs list-tasks --cluster 4paws-staging

# Update service (force new deployment)
aws ecs update-service --cluster 4paws-staging --service 4paws-backend-service --force-new-deployment

# Scale service
aws ecs update-service --cluster 4paws-staging --service 4paws-backend-service --desired-count 3

# View ALB metrics
aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name TargetResponseTime --dimensions Name=LoadBalancer,Value=app/4paws-alb/xxxxx --start-time 2024-01-01T00:00:00Z --end-time 2024-01-02T00:00:00Z --period 300 --statistics Average,Maximum
```

## Support & Troubleshooting

See `DEPLOYMENT_AWS.md` for detailed troubleshooting guide.

For AWS support: https://console.aws.amazon.com/support/
For Expo support: https://docs.expo.dev/
For Stripe support: https://support.stripe.com/
