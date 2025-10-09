#!/bin/bash

# WarmeLeads Server Monitor & Auto-Recovery
# Duurzame fix voor server crashes

echo "🔍 WarmeLeads Server Monitor started"
echo "⏰ $(date)"

# Configuration
MAX_RETRIES=5
RETRY_DELAY=10
HEALTH_CHECK_INTERVAL=30
SERVER_URL="http://localhost:3000"

# Function to check if server is running
check_server() {
    if curl -s --max-time 5 "$SERVER_URL" >/dev/null 2>&1; then
        return 0  # Server is running
    else
        return 1  # Server is down
    fi
}

# Function to restart server
restart_server() {
    echo "🔄 Restarting WarmeLeads server..."
    
    # Kill existing processes
    pkill -f "next dev" 2>/dev/null || true
    sleep 3
    
    # Clear cache
    rm -rf .next 2>/dev/null || true
    
    # Start new server
    npm run dev:stable &
    
    # Wait for server to start
    sleep 10
    
    if check_server; then
        echo "✅ Server restarted successfully"
        return 0
    else
        echo "❌ Server restart failed"
        return 1
    fi
}

# Main monitoring loop
retry_count=0

while true; do
    if check_server; then
        echo "✅ $(date '+%H:%M:%S') - Server is healthy"
        retry_count=0
    else
        echo "⚠️  $(date '+%H:%M:%S') - Server is down!"
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            ((retry_count++))
            echo "🔄 Attempting restart ($retry_count/$MAX_RETRIES)..."
            
            if restart_server; then
                echo "🎉 Server recovered successfully!"
            else
                echo "❌ Restart attempt $retry_count failed"
                sleep $RETRY_DELAY
            fi
        else
            echo "🚨 Maximum retries reached. Manual intervention required."
            echo "📧 Please check the server logs and restart manually."
            exit 1
        fi
    fi
    
    sleep $HEALTH_CHECK_INTERVAL
done


