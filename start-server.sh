#!/bin/bash

# WarmeLeads Development Server Auto-Restart Script
# Dit script start de server opnieuw als hij crasht

echo "🚀 WarmeLeads Development Server wordt gestart..."
echo "📍 Server draait op: http://localhost:3000"
echo "📝 Logs worden opgeslagen in: server.log"
echo "🔄 Auto-restart is ingeschakeld"
echo ""

# Functie om server te starten
start_server() {
    echo "🔄 Server starten..."
    npm run dev >> server.log 2>&1
}

# Functie om server te controleren
check_server() {
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ Server is niet bereikbaar, herstarten..."
        start_server
    fi
}

# Start de server
start_server &

# Wacht even tot de server is opgestart
sleep 5

# Controleer elke 30 seconden of de server nog draait
while true; do
    check_server
    sleep 30
done
