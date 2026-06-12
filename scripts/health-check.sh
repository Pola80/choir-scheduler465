#!/bin/bash

# Health Check Script for Choir Scheduler
# This script monitors the application and restarts it if needed

set -e

APP_PORT=3000
APP_URL="http://localhost:${APP_PORT}"
LOG_FILE="./logs/health-check.log"
MAX_RETRIES=3
RETRY_DELAY=5

# Create logs directory
mkdir -p ./logs

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_health() {
    log_message "🔍 Checking application health..."
    
    # Check if port is listening
    if ! lsof -i ":${APP_PORT}" > /dev/null 2>&1; then
        log_message "⚠️  Application not running on port ${APP_PORT}"
        return 1
    fi
    
    # Check HTTP response
    if ! curl -sf "${APP_URL}" > /dev/null 2>&1; then
        log_message "⚠️  Application not responding to HTTP requests"
        return 1
    fi
    
    log_message "✅ Application is healthy"
    return 0
}

restart_app() {
    log_message "🔄 Restarting application..."
    
    # Kill existing process
    pkill -f "node dist/server.js" || true
    sleep 2
    
    # Start application
    npm start > /dev/null 2>&1 &
    
    # Wait for startup
    sleep 5
    
    # Verify restart
    if check_health; then
        log_message "✅ Application restarted successfully"
        return 0
    else
        log_message "❌ Failed to restart application"
        return 1
    fi
}

# Main health check loop
RETRY_COUNT=0

while true; do
    if check_health; then
        RETRY_COUNT=0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            log_message "❌ Health check failed $MAX_RETRIES times, restarting..."
            if restart_app; then
                RETRY_COUNT=0
            else
                log_message "❌ Critical: Unable to restart application"
                exit 1
            fi
        else
            log_message "⏳ Retry $RETRY_COUNT/$MAX_RETRIES in ${RETRY_DELAY}s..."
            sleep "$RETRY_DELAY"
        fi
    fi
    
    # Check every 30 seconds
    sleep 30
done
