# Deployment Guide for NestJS Furniro Application

This guide details the process of deploying the NestJS Furniro application on an AWS EC2 instance, including setup of Nginx, SSL/HTTPS, domain configuration, S3 storage, and CI/CD with GitHub Actions.

## Table of Contents
1. [Setup AWS EC2 Instance](#setup-aws-ec2-instance)
2. [Configure Firewall Rules](#configure-firewall-rules)
3. [Setup S3 Bucket for File Storage](#setup-s3-bucket-for-file-storage)
4. [Install Required Software on EC2](#install-required-software-on-ec2)
5. [Deploy Application on EC2](#deploy-application-on-ec2)
6. [Configure Nginx as Reverse Proxy](#configure-nginx-as-reverse-proxy)
7. [Domain Configuration](#domain-configuration)
8. [SSL/HTTPS Configuration with Certbot](#sslhttps-configuration-with-certbot)
9. [Configure CI/CD with GitHub Actions](#configure-cicd-with-github-actions)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Setup AWS EC2 Instance

### Launch a New EC2 Instance
1. Log in to the AWS Management Console
2. Navigate to EC2 service
3. Click "Launch Instance"
4. Select an Amazon Machine Image (AMI) - Recommended: Ubuntu Server 22.04 LTS
5. Choose an instance type (recommended t2.micro for testing, t2.small or t2.medium for production)
6. Configure Instance Details:
   - Network: Default VPC
   - Subnet: Choose any available subnet
   - Auto-assign Public IP: Enable
7. Add Storage: Default 8GB is sufficient to start
8. Add Tags: Key=Name, Value=furniro-backend
9. Configure Security Group (see Firewall Rules section below)
10. Review and Launch
11. Create a new key pair or use an existing one (save the .pem file securely)
12. Launch Instance

### Connect to Your EC2 Instance
```bash
chmod 400 your-key-pair.pem
ssh -i your-key-pair.pem ubuntu@your-ec2-public-dns
```

## Configure Firewall Rules

### Security Group Setup in AWS Console
Configure the following inbound rules:
- SSH (port 22) - Source: Your IP or Anywhere (0.0.0.0/0) for development
- HTTP (port 80) - Source: Anywhere (0.0.0.0/0)
- HTTPS (port 443) - Source: Anywhere (0.0.0.0/0)
- Custom TCP (port 3000) - Source: Your IP (for direct access to the application if needed)

### UFW Setup on Ubuntu Server
```bash
# Install UFW if not already installed
sudo apt-get update
sudo apt-get install ufw

# Allow necessary connections
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000/tcp  # Application port

# Enable UFW
sudo ufw enable

# Check status
sudo ufw status
```

## Setup S3 Bucket for File Storage

1. Log in to AWS Management Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Enter a bucket name (e.g., furniro-files)
5. Select the region (choose the same region as your EC2 instance)
6. Block all public access (uncheck the option if you need public access to files)
7. Enable versioning if needed
8. Create bucket

### Configure IAM User for S3 Access

1. Navigate to IAM service
2. Create a new user with programmatic access
3. Attach the 'AmazonS3FullAccess' policy (or create a custom policy with limited permissions)
4. Save the Access Key ID and Secret Access Key securely

### Update .env File with S3 Configuration
```
AWS_S3_REGION=your-region
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

## Install Required Software on EC2

### Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Install Node.js and npm using NVM
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 22.11.0
nvm use 22.11.0
nvm alias default 22.11.0

# Verify installation
node -v
npm -v
```

### Install Git
```bash
sudo apt-get install git -y
```

### Install PM2 for Process Management
```bash
npm install -g pm2
```

### Install Nginx
```bash
sudo apt-get install nginx -y
```

## Deploy Application on EC2

### Clone Repository
```bash
cd ~
git clone https://github.com/yourusername/backend-nestjs-furniro-dev.git
cd backend-nestjs-furniro-dev
```

### Set Environment Variables
```bash
# Create .env file with production values
nano .env
```

Add all required environment variables including:
```
PORT=3000
DATABASE_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d
# S3 configuration
AWS_S3_REGION=your-region
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
# Other application-specific variables
```

### Install Dependencies and Build
```bash
npm install --force
npm run build
```

### Start Application with PM2
```bash
pm2 start ecosystem.config.cjs
# OR if you want to start without config file
pm2 start dist/main.js --name "BE Furniro dev"

# Set PM2 to start on boot
pm2 startup
# Execute the command PM2 provides
pm2 save
```

## Configure Nginx as Reverse Proxy

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/furniro
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Set client max body size for file uploads
    client_max_body_size 10M;
}
```

### Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/furniro /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Domain Configuration

1. Log in to your domain registrar (e.g., GoDaddy, Namecheap, Route53)
2. Navigate to DNS management
3. Add an A record:
   - Type: A
   - Host: @ (or subdomain)
   - Value: Your EC2 instance's public IP address
   - TTL: 3600 (or lower for faster propagation)
4. Add a CNAME record for www (optional):
   - Type: CNAME
   - Host: www
   - Value: your-domain.com
   - TTL: 3600

DNS propagation may take up to 48 hours, but typically completes within a few hours.

## SSL/HTTPS Configuration with Certbot

### Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx -y
```

### Obtain and Install SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to the terms of service
3. Choose whether to share your email
4. Select whether to redirect HTTP to HTTPS (recommended)

Certbot will automatically update your Nginx configuration to use SSL.

### Auto-renewal Setup
Certbot creates a systemd timer by default that will renew certificates. Verify it with:
```bash
sudo systemctl list-timers
```

## Configure CI/CD with GitHub Actions

### Create GitHub Secrets
In your GitHub repository, go to Settings > Secrets and Variables > Actions and add the following secrets:
- `HOST_PRODUCTION`: EC2 instance public IP address or hostname
- `USERNAME_PRODUCTION`: EC2 username (usually 'ubuntu')
- `PORT_PRODUCTION`: SSH port (usually 22)
- `SSH_PRIVATE_KEY`: Content of your private SSH key
- `ENV_PRODUCTION`: Complete content of your production .env file

### Create GitHub Workflow File
The workflow file already exists at `.github/workflows/deploy-production.yml`. Here's a review of what it does:

1. Triggered on push/pull requests to master branch
2. Builds the application
3. Deploys to EC2 using SSH
4. Updates the application and restarts the PM2 process

```yaml
name: Deploy Production

on:
  push:
    branches: ['master']
  pull_request:
    branches: ['master']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.11.0
          cache: 'npm'
      - name: Create .env file
        run: echo "${{ secrets.ENV_PRODUCTION }}" >> .env
      - run: npm i --force
      - run: npm run build
  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: 'Executing remote ssh commands using ssh key'
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.HOST_PRODUCTION }}
          username: ${{ secrets.USERNAME_PRODUCTION }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.PORT_PRODUCTION }}
          script: |
            export NVM_DIR=~/.nvm
            source ~/.nvm/nvm.sh
            cd ~/backend-nestjs-furniro-dev
            git fetch --all
            git reset --hard origin/master
            echo "${{ secrets.ENV_PRODUCTION }}" > .env
            npm install --force
            npm run build
            pm2 restart "BE Furniro dev"
```

## Monitoring and Maintenance

### Monitor Application with PM2
```bash
pm2 status
pm2 logs
pm2 monit  # Interactive monitoring
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Renewal
```bash
# Test the renewal process
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Server Updates
Regularly update your server:
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Backup Database and Environment
Regularly backup your MongoDB database and your .env file.

### S3 Bucket Management
Regularly check your S3 bucket usage and consider implementing lifecycle policies for cost optimization.

## Troubleshooting

### Common Issues and Solutions

1. **Application not starting:**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables: `cat .env`
   - Check for port conflicts: `sudo lsof -i :3000`

2. **Nginx error:**
   - Check configuration: `sudo nginx -t`
   - View logs: `sudo tail -f /var/log/nginx/error.log`

3. **SSL certificate issues:**
   - Check expiration: `sudo certbot certificates`
   - Renew manually: `sudo certbot renew`

4. **GitHub Actions failing:**
   - Check workflow runs in GitHub repository
   - Verify all secrets are correctly set
   - Ensure SSH key has proper permissions on EC2 instance

5. **S3 connection issues:**
   - Verify IAM permissions
   - Check network connectivity from EC2 to S3
   - Validate environment variables
``` 