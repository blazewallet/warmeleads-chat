#!/bin/bash

# WarmeLeads Auto-Start Script
# Dit script zorgt ervoor dat je altijd in de juiste map zit

echo "🚀 WarmeLeads Auto-Start Script"
echo "================================"

# Controleer of we in de juiste map zitten
if [[ "$PWD" != */warmeleads-chat ]]; then
    echo "📍 Navigeer naar de juiste map..."
    cd /Users/rickschlimback/Desktop/WL1sep/warmeleads-chat
    echo "✅ Nu in: $PWD"
else
    echo "✅ Al in de juiste map: $PWD"
fi

# Controleer of package.json bestaat
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json niet gevonden!"
    echo "📍 Huidige map: $PWD"
    echo "📍 Verwacht: /Users/rickschlimback/Desktop/WL1sep/warmeleads-chat"
    exit 1
fi

echo "✅ package.json gevonden"
echo "🚀 Start de server..."

# Start de server
npm start
