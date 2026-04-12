const express = require('express');
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 5500;

let snakeServerProcess = null;
let snakeClientProcess = null;

// Serve static files from Portfolio-Redesign
app.use(express.static(__dirname));

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port, method: 'GET', timeout: 1000 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Kill process on port
function killPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, () => resolve());
  });
}

// Start snake-io server
async function startSnakeServer() {
  if (await isPortInUse(3001)) {
    console.log('📡 Snake server already running on port 3001');
    return true;
  }

  console.log('📡 Starting Snake.io server...');
  
  snakeServerProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'snake-io-multiplayer/server'),
    stdio: 'inherit',
    shell: true
  });

  // Wait for server to start
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isPortInUse(3001)) {
      console.log('✅ Snake server started!');
      return true;
    }
  }
  return false;
}

// Start snake-io client
async function startSnakeClient() {
  if (await isPortInUse(5173)) {
    console.log('🎮 Snake client already running on port 5173');
    return true;
  }

  console.log('🎮 Starting Snake.io client...');
  
  snakeClientProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'snake-io-multiplayer/client'),
    stdio: 'inherit',
    shell: true
  });

  // Wait for client to start
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isPortInUse(5173)) {
      console.log('✅ Snake client started!');
      return true;
    }
  }
  return false;
}

// Route to launch snake-io
app.get('/launch-snake-io', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Launching Snake.io...</title>
      <style>
        body {
          background: #000;
          color: #fff;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
        }
        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h1 { font-size: 2rem; margin-bottom: 10px; }
        p { opacity: 0.7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader"></div>
        <h1>🐍 Starting Snake.io</h1>
        <p id="status">Initializing server...</p>
      </div>
      <script>
        async function checkAndRedirect() {
          const status = document.getElementById('status');
          
          // Trigger server start
          await fetch('/api/start-snake-io');
          
          // Check if client is ready
          for (let i = 0; i < 30; i++) {
            status.textContent = 'Starting game services... (' + (i+1) + 's)';
            try {
              const res = await fetch('http://localhost:5173/snake-io-multiplayer/', { mode: 'no-cors' });
              window.location.href = 'http://localhost:5173/snake-io-multiplayer/';
              return;
            } catch(e) {}
            await new Promise(r => setTimeout(r, 1000));
          }
          status.textContent = 'Failed to start. Please run ./start-snake-io.sh manually.';
        }
        checkAndRedirect();
      </script>
    </body>
    </html>
  `);
});

// API endpoint to start snake-io services
app.get('/api/start-snake-io', async (req, res) => {
  try {
    await startSnakeServer();
    await startSnakeClient();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (snakeServerProcess) snakeServerProcess.kill();
  if (snakeClientProcess) snakeClientProcess.kill();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`🌐 Portfolio server running at http://localhost:${PORT}`);
  console.log(`🐍 Visit http://localhost:${PORT}/launch-snake-io to auto-start the game`);
});
