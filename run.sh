#!/bin/bash

set -e

echo "🚀 Choir Scheduler - Process Management Script"
echo ""

command=$1

case $command in
  start)
    echo "Starting application with PM2..."
    pm2 start ecosystem.config.json
    echo "✅ Application started"
    pm2 logs choir-scheduler
    ;;

  stop)
    echo "Stopping application..."
    pm2 stop choir-scheduler
    echo "✅ Application stopped"
    ;;

  restart)
    echo "Restarting application..."
    pm2 restart choir-scheduler
    echo "✅ Application restarted"
    ;;

  logs)
    echo "Showing application logs (Ctrl+C to exit)..."
    pm2 logs choir-scheduler
    ;;

  status)
    echo "Application status:"
    pm2 status
    ;;

  delete)
    echo "⚠️  Removing application from PM2..."
    pm2 delete choir-scheduler
    echo "✅ Application removed"
    ;;

  save)
    echo "Saving PM2 process list..."
    pm2 save
    echo "✅ Process list saved"
    ;;

  resurrect)
    echo "Restoring saved PM2 processes..."
    pm2 resurrect
    echo "✅ Processes restored"
    ;;

  install)
    echo "Installing PM2 and dependencies..."
    npm install -g pm2
    npm install
    npm run build
    echo "✅ Installation complete"
    echo "Now run: ./run.sh start"
    ;;

  *)
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install    - Install PM2 and dependencies"
    echo "  start      - Start application with PM2"
    echo "  stop       - Stop application"
    echo "  restart    - Restart application"
    echo "  status     - Show application status"
    echo "  logs       - Show real-time logs"
    echo "  delete     - Remove from PM2"
    echo "  save       - Save current process list"
    echo "  resurrect  - Restore saved processes"
    echo ""
    echo "Example: ./run.sh start"
    ;;
esac
