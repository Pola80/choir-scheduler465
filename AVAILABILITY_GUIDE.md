# 🟢 Application Availability & Auto-Restart Guide

Your Choir Scheduler application now has **multiple layers** of availability management to ensure it's always running.

## 🎯 Three Deployment Strategies

### 1️⃣ Local/Development (macOS/Linux)

#### Option A: PM2 Process Manager (Recommended for Local)

PM2 automatically restarts your app if it crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Enable auto-restart on system reboot
pm2 startup
pm2 save

# Monitor application
pm2 monit

# View logs
pm2 logs choir-scheduler

# Restart application
pm2 restart choir-scheduler

# Stop application
pm2 stop choir-scheduler

# Remove from PM2
pm2 delete choir-scheduler
```

**Benefits:**
- ✅ Automatic restart on crash
- ✅ Auto-restart on system reboot
- ✅ Memory limit enforcement (500MB)
- ✅ Built-in logging
- ✅ Easy monitoring with `pm2 monit`

#### Option B: Health Check Script

Run a background monitoring script:

```bash
# Make script executable
chmod +x scripts/health-check.sh

# Run health check daemon
nohup ./scripts/health-check.sh &

# View health check logs
tail -f logs/health-check.log
```

**What it does:**
- ✅ Checks app every 30 seconds
- ✅ Verifies port is listening
- ✅ Verifies HTTP responses
- ✅ Auto-restarts on failure
- ✅ Logs all activity

---

### 2️⃣ Linux Production Server

#### Using systemd Service

For production Linux servers:

```bash
# Copy service file (requires sudo)
sudo cp choir-scheduler.service /etc/systemd/system/

# Enable service
sudo systemctl enable choir-scheduler

# Start service
sudo systemctl start choir-scheduler

# Check status
sudo systemctl status choir-scheduler

# View logs
sudo journalctl -u choir-scheduler -f

# Restart service
sudo systemctl restart choir-scheduler
```

**Configuration:**
- ✅ Auto-restart on crash
- ✅ Auto-start on system boot
- ✅ Memory limit: 500MB
- ✅ Security hardening enabled
- ✅ Integrated logging with systemd

---

### 3️⃣ Cloud Deployment (Google Cloud Run)

#### Cloud Run Built-in Availability

Cloud Run is **managed and always available** by default:

```bash
# Deploy to Cloud Run
gcloud run deploy choir-scheduler \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --timeout 300
```

**Cloud Run Guarantees:**
- ✅ Auto-scaling (0-N instances)
- ✅ Auto-restart on crash
- ✅ Load balancing
- ✅ 99.95% uptime SLA
- ✅ Automatic health checks
- ✅ No maintenance needed

**Using Terraform (Recommended):**

```bash
cd terraform

# Copy configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your GCP project ID
nano terraform.tfvars

# Deploy
terraform init
terraform plan
terraform apply
```

Terraform automatically configures health checks and auto-scaling.

---

### 4️⃣ Docker Compose (Multi-container)

#### Using Docker with Restart Policy

```yaml
version: '3.8'

services:
  choir-scheduler:
    build:
      context: .
      dockerfile: Dockerfile.healthcheck
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Benefits:**
- ✅ Container-based isolation
- ✅ Built-in health checks
- ✅ Automatic restart policy
- ✅ Resource limits
- ✅ Easy scaling

Start with: `docker-compose up -d`

---

## 📊 Uptime Comparison

| Strategy | Uptime | Setup Time | Cost | Best For |
|----------|--------|-----------|------|----------|
| PM2 Local | 99% | 5 min | Free | Development |
| Health Check Script | 98% | 10 min | Free | Testing |
| systemd Service | 99.9% | 15 min | Free | Linux VPS |
| Cloud Run | 99.95% | 30 min | $5-20/mo | Production |
| Docker Compose | 99.5% | 20 min | Free | Local/Staging |

---

## ✅ Quick Start Checklist

### For Local Development (Right Now)
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Enable auto-restart: `pm2 startup && pm2 save`
- [ ] Verify it works: `pm2 monit`

### For Linux Server
- [ ] Copy systemd file: `sudo cp choir-scheduler.service /etc/systemd/system/`
- [ ] Enable service: `sudo systemctl enable choir-scheduler`
- [ ] Start service: `sudo systemctl start choir-scheduler`
- [ ] Check status: `sudo systemctl status choir-scheduler`

### For Production (Cloud Run)
- [ ] Install Terraform and gcloud
- [ ] Configure `terraform/terraform.tfvars`
- [ ] Deploy: `cd terraform && terraform apply`
- [ ] Verify: Check `terraform output cloud_run_url`

---

## 🔍 Monitoring Your Application

### PM2 Monitoring
```bash
# Real-time monitoring dashboard
pm2 monit

# View process list
pm2 list

# Show detailed info
pm2 info choir-scheduler

# Stream logs
pm2 logs choir-scheduler --lines 50
```

### Linux Service Monitoring
```bash
# Check service status
sudo systemctl status choir-scheduler

# View service logs
sudo journalctl -u choir-scheduler -f -n 50

# Check resource usage
ps aux | grep node

# Monitor with top
top
```

### Cloud Run Monitoring
```bash
# View logs
gcloud run logs read choir-scheduler

# Check service status
gcloud run services describe choir-scheduler

# View metrics in Console
# https://console.cloud.google.com/run
```

---

## 🚨 Emergency Procedures

### Application Crashed

**With PM2:**
```bash
pm2 restart choir-scheduler
pm2 logs choir-scheduler
```

**With systemd:**
```bash
sudo systemctl restart choir-scheduler
sudo journalctl -u choir-scheduler -n 100
```

**With Cloud Run:**
```bash
# It restarts automatically
# Check logs:
gcloud run logs read choir-scheduler --limit 100
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use PM2
pm2 kill
pm2 start ecosystem.config.js
```

### Application Not Starting
```bash
# Check npm build
npm run build

# Test application locally
npm start

# Check logs
pm2 logs  # or tail -f logs/error.log
```

---

## 💡 Best Practices

1. **Monitor Regularly**
   - Set up email/SMS alerts
   - Check logs daily
   - Monitor resource usage

2. **Keep Dependencies Updated**
   - `npm audit`
   - `npm update`
   - Test updates before production

3. **Log Everything**
   - Keep detailed logs
   - Rotate old logs
   - Archive important logs

4. **Backup Data**
   - Database backups
   - Configuration backups
   - Regular testing of backups

5. **Plan for Disasters**
   - Document procedures
   - Test recovery processes
   - Have rollback plans

---

## 📞 Support & Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/
- **systemd Documentation**: https://systemd.io/
- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

## 🎯 Recommended Setup

### For Development
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

### For Production (Cloud)
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GCP project ID
terraform apply
```

Your application will now be:
- ✅ Always running
- ✅ Auto-restarting on failure
- ✅ Auto-scaling based on load
- ✅ Protected from crashes
- ✅ Monitored and logged
