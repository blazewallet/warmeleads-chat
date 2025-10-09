#!/bin/bash

# Stable Next.js Development Server Starter
# Duurzame fix voor server instabiliteit

echo "🚀 Starting WarmeLeads Development Server..."

# Kill any existing Next.js processes
echo "🔄 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clear Next.js cache to prevent memory issues
echo "🧹 Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Check Node.js memory and optimize
echo "💾 Optimizing Node.js memory settings..."
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=256"

# Set development environment
export NODE_ENV=development

# Function to start server with retry logic
start_server() {
    local attempt=1
    local max_attempts=3
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔧 Starting server (attempt $attempt/$max_attempts)..."
        
        # Start Next.js with optimized settings
        npm run dev 2>&1 | while IFS= read -r line; do
            echo "$(date '+%H:%M:%S') $line"
            
            # Check for critical errors that require restart
            if echo "$line" | grep -q "EADDRINUSE\|ECONNREFUSED\|Memory\|heap"; then
                echo "❌ Critical error detected, restarting..."
                pkill -f "next dev" 2>/dev/null || true
                sleep 3
                return 1
            fi
        done
        
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo "✅ Server started successfully!"
            break
        else
            echo "⚠️  Server crashed, retrying in 5 seconds..."
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ Failed to start server after $max_attempts attempts"
        echo "📧 Please check the logs or contact support"
        exit 1
    fi
}

# Health check function
health_check() {
    local retries=0
    local max_retries=10
    
    while [ $retries -lt $max_retries ]; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo "✅ Server is healthy and responding"
            return 0
        fi
        
        echo "⏳ Waiting for server to start... ($((retries + 1))/$max_retries)"
        sleep 2
        ((retries++))
    done
    
    echo "❌ Server health check failed"
    return 1
}

# Trap to clean up on exit
trap 'echo "🛑 Shutting down server..."; pkill -f "next dev" 2>/dev/null || true; exit 0' INT TERM

# Main execution
echo "🌟 WarmeLeads Server Manager"
echo "📁 Working directory: $(pwd)"
echo "🕐 Started at: $(date)"
echo ""

# Start the server
start_server &
SERVER_PID=$!

# Wait a bit and then do health check
sleep 5
health_check

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 WarmeLeads is now running!"
    echo "🌐 Open: http://localhost:3000"
    echo "🔄 Auto-restart enabled"
    echo "🛑 Press Ctrl+C to stop"
    echo ""
    
    # Keep the script running and monitor the server
    wait $SERVER_PID
else
    echo ""
    echo "❌ Failed to start WarmeLeads server"
    echo "🔍 Check the error messages above"
    exit 1
fi


