#!/bin/bash

# Flax-ERP Development Environment Script
# Supports: setup, start, stop, restart, status

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Flax-ERP"
PORT=5000
BACKEND_PORT=8000
DB_NAME="flaxerp"
LOG_DIR="./logs"
PID_FILE="./.pid"

# Create log directory if not exists
mkdir -p $LOG_DIR

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Function to check if the app is running
is_running() {
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p $pid > /dev/null; then
      return 0 # true
    fi
  fi
  return 1 # false
}

# Function to prepare the environment
setup() {
  print_message $BLUE "Setting up $PROJECT_NAME development environment..."
  
  # Check if Node.js is installed
  if ! command -v node &> /dev/null; then
    print_message $RED "Node.js is not installed. Please install Node.js and try again."
    exit 1
  fi
  
  # Check npm version
  npm_version=$(npm -v)
  print_message $BLUE "Using npm version: $npm_version"
  
  # Install dependencies
  print_message $BLUE "Installing dependencies..."
  npm install
  
  # Check if database is accessible
  if [ -n "$DATABASE_URL" ]; then
    print_message $BLUE "Checking database connection..."
    # Push schema to database
    npm run db:push
    if [ $? -eq 0 ]; then
      print_message $GREEN "Database setup successful."
    else
      print_message $YELLOW "Warning: Database schema update failed. Check your database connection."
    fi
  else
    print_message $YELLOW "Warning: DATABASE_URL not set. Using in-memory storage."
  fi
  
  print_message $GREEN "Setup completed successfully. You can now start the application with './start.sh start'"
}

# Function to start the application
start() {
  if is_running; then
    print_message $YELLOW "$PROJECT_NAME is already running with PID $(cat $PID_FILE)"
    return
  fi
  
  print_message $BLUE "Starting $PROJECT_NAME in development mode..."
  npm run dev > "$LOG_DIR/app.log" 2>&1 &
  echo $! > "$PID_FILE"
  
  # Verify the process started
  if is_running; then
    print_message $GREEN "$PROJECT_NAME started successfully with PID $(cat $PID_FILE)"
    print_message $GREEN "Frontend is accessible at: http://localhost:$PORT"
    print_message $GREEN "Backend API is accessible at: http://localhost:$PORT/api"
    print_message $BLUE "Logs are being written to $LOG_DIR/app.log"
  else
    print_message $RED "Failed to start $PROJECT_NAME. Check logs for more information."
  fi
}

# Function to stop the application
stop() {
  if is_running; then
    local pid=$(cat "$PID_FILE")
    print_message $BLUE "Stopping $PROJECT_NAME (PID: $pid)..."
    kill $pid
    sleep 2
    
    # Verify process was stopped
    if ! ps -p $pid > /dev/null; then
      rm -f "$PID_FILE"
      print_message $GREEN "$PROJECT_NAME stopped successfully."
    else
      print_message $YELLOW "Process did not terminate gracefully. Force killing..."
      kill -9 $pid
      rm -f "$PID_FILE"
      print_message $GREEN "$PROJECT_NAME force stopped."
    fi
  else
    print_message $YELLOW "$PROJECT_NAME is not running."
  fi
}

# Function to restart the application
restart() {
  print_message $BLUE "Restarting $PROJECT_NAME..."
  stop
  sleep 2
  start
}

# Function to check application status
status() {
  if is_running; then
    local pid=$(cat "$PID_FILE")
    print_message $GREEN "$PROJECT_NAME is running (PID: $pid)"
    
    # Display resource usage
    print_message $BLUE "Current resource usage:"
    ps -p $pid -o pid,ppid,%cpu,%mem,cmd | head -n 2
    
    # Check port status
    print_message $BLUE "Port status:"
    if command -v lsof &> /dev/null; then
      lsof -i :$PORT | grep LISTEN || print_message $YELLOW "No process listening on port $PORT"
    else
      netstat -tuln | grep $PORT || print_message $YELLOW "No process listening on port $PORT"
    fi
    
    # Show recent logs
    print_message $BLUE "Recent logs:"
    tail -n 5 "$LOG_DIR/app.log"
  else
    print_message $YELLOW "$PROJECT_NAME is not running."
  fi
}

# Function to display help message
show_help() {
  echo "Usage: ./start.sh [command]"
  echo ""
  echo "Commands:"
  echo "  setup    - Install dependencies and prepare the development environment"
  echo "  start    - Start the application in development mode"
  echo "  stop     - Stop the running application"
  echo "  restart  - Restart the application"
  echo "  status   - Check the status of the application and show resource usage"
  echo "  help     - Show this help message"
  echo ""
}

# Main script execution
case "$1" in
  setup)
    setup
    ;;
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  status)
    status
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
