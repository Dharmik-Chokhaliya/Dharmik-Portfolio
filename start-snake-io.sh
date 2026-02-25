#!/bin/bash
# Start Snake.io Multiplayer (Server + Client)

echo "🐍 Starting Snake.io Multiplayer..."

# Check if ports are in use and kill existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Navigate to server directory and start server in background
echo "📡 Starting server on port 3001..."
cd "$(dirname "$0")/snake-io-multiplayer/server"
npm install --silent 2>/dev/null
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Navigate to client directory and start client in background
echo "🎮 Starting client on port 5173..."
cd "$(dirname "$0")/snake-io-multiplayer/client"
npm install --silent 2>/dev/null
npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ Snake.io Multiplayer is running!"
echo "   Server: http://localhost:3001"
echo "   Client: http://localhost:5173/snake-io-multiplayer/"
echo ""
echo "Press Ctrl+C to stop both services."

# Handle cleanup on exit
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo '🛑 Stopped Snake.io services.'; exit" SIGINT SIGTERM

# Wait for either process
wait
