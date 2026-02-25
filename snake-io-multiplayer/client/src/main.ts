import { Game } from './game/Game';
import { SkinSelector } from './ui/SkinSelector';

// DOM Elements
const menuScreen = document.getElementById('menuScreen') as HTMLDivElement;
const deathScreen = document.getElementById('deathScreen') as HTMLDivElement;
const playerNameInput = document.getElementById('playerNameInput') as HTMLInputElement;
const playButton = document.getElementById('playButton') as HTMLButtonElement;
const playAgainButton = document.getElementById('playAgainButton') as HTMLButtonElement;
const loadingOverlay = document.getElementById('loadingOverlay') as HTMLDivElement;
const loadingText = document.getElementById('loadingText') as HTMLParagraphElement;
const hud = document.getElementById('hud') as HTMLDivElement;
const mobileControls = document.getElementById('mobileControls') as HTMLDivElement;
const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement;
const finalScore = document.getElementById('finalScore') as HTMLSpanElement;
const finalLength = document.getElementById('finalLength') as HTMLSpanElement;
const leaderboardToggle = document.getElementById('leaderboardToggle') as HTMLButtonElement;
const leaderboard = document.getElementById('leaderboard') as HTMLDivElement;
const shareButton = document.getElementById('shareButton') as HTMLButtonElement;
const shareLinkInput = document.getElementById('shareLinkInput') as HTMLInputElement;
const copyLinkBtn = document.getElementById('copyLinkBtn') as HTMLButtonElement;

if (leaderboardToggle && leaderboard) {
  leaderboardToggle.addEventListener('click', () => {
    leaderboard.classList.toggle('collapsed');
    leaderboardToggle.textContent = leaderboard.classList.contains('collapsed') ? '◀' : '▼';
  });
}

// Initialize game and skin selector
const game = new Game();
let skinSelector: SkinSelector | null = null;

// Server URL - use environment variable or default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Room ID from URL or generate new one
function getRoomId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('room');
  if (!roomId) {
    roomId = generateRoomId();
    // Update URL without refresh
    const newUrl = `${window.location.pathname}?room=${roomId}`;
    window.history.replaceState({}, '', newUrl);
  }
  return roomId;
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const currentRoomId = getRoomId();

// Update share link
function updateShareLink() {
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
  if (shareLinkInput) {
    shareLinkInput.value = shareUrl;
  }
}

// Copy link functionality
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
      copyLinkBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyLinkBtn.textContent = 'Copy';
      }, 2000);
    });
  });
}

// Check if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Show mobile controls if needed
if (isMobile) {
  mobileControls.classList.remove('hidden');
}

// Initialize skin selector when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  skinSelector = new SkinSelector();
  updateShareLink();
});

// Play button click
playButton.addEventListener('click', startGame);
playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') startGame();
});

// Play again button - directly respawn
playAgainButton.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim() || `Player${Math.floor(Math.random() * 1000)}`;
  const skin = skinSelector?.getSkin();
  
  deathScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  
  game.respawn(playerName, skin);
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Server connection with retry
async function connectWithRetry(maxRetries = 5): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (loadingText) {
        loadingText.textContent = i === 0 
          ? 'Connecting to server...' 
          : `Retrying connection (${i + 1}/${maxRetries})...`;
      }
      await game.connect(SERVER_URL);
      return true;
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed`);
      if (i < maxRetries - 1) {
        if (loadingText) {
          loadingText.textContent = 'Server starting, please wait...';
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
}

async function startGame() {
  const playerName = playerNameInput.value.trim() || `Player${Math.floor(Math.random() * 1000)}`;
  const skin = skinSelector?.getSkin();
  
  // Show loading
  loadingOverlay.classList.remove('hidden');
  menuScreen.classList.add('hidden');
  
  try {
    const connected = await connectWithRetry();
    
    if (!connected) {
      throw new Error('Could not connect to server');
    }
    
    game.joinGame(playerName, skin);
    
    // Hide loading, show HUD
    loadingOverlay.classList.add('hidden');
    hud.classList.remove('hidden');
    
    // Start game loop
    game.start();
    
  } catch (error) {
    console.error('Failed to connect:', error);
    loadingOverlay.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    alert('Failed to connect to server. Please make sure the server is running on port 3001.');
  }
}

// Handle death event
game.onDeath = (score: number, length: number) => {
  hud.classList.add('hidden');
  deathScreen.classList.remove('hidden');
  finalScore.textContent = score.toString();
  finalLength.textContent = length.toString();
};

// Handle respawn
game.onRespawn = () => {
  deathScreen.classList.add('hidden');
  hud.classList.remove('hidden');
};

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(console.error);
    fullscreenBtn.textContent = '⛶';
  } else {
    document.exitFullscreen().catch(console.error);
    fullscreenBtn.textContent = '⛶';
  }
}

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

// Focus name input on load
window.addEventListener('load', () => {
  playerNameInput.focus();
});

// Handle visibility change (pause when tab hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause();
  } else {
    game.resume();
  }
});

// PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed - that's okay
    });
  });
}

console.log('🐍 Snake.io Client initialized');
