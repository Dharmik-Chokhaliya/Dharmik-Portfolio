# 🚀 Snake.io Multiplayer Deployment Guide

Deploy your multiplayer game so anyone can play from anywhere!

## Overview
- **Server (Backend):** Railway (free tier)
- **Client (Frontend):** GitHub Pages (free)

---

## Step 1: Push to GitHub

```bash
cd snake-io-multiplayer
git add .
git commit -m "Initial commit - Snake.io Multiplayer Game"
git push origin main
```

---

## Step 2: Deploy Server to Railway

Railway hosts your Node.js server with WebSocket support.

1. Go to [Railway.app](https://railway.app/) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `snake-io-multiplayer` repository
4. Go to **Settings** tab:
   - Set **Root Directory** to: `server`
   - Set **Build Command** to: `npm run build`
   - Set **Start Command** to: `npm start`
5. Go to **Variables** tab and add:
   - `PORT` = `3001`
6. Click **"Generate Domain"** to get your server URL
   - Example: `https://snake-server-abc123.up.railway.app`
   - **COPY THIS URL** for the next step

Wait for deployment to finish (green checkmark ✅).

---

## Step 3: Configure Client to Use Production Server

1. Edit `client/.env.production`:
```env
VITE_SERVER_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

2. Commit and push:
```bash
git add client/.env.production
git commit -m "Add production server URL"
git push
```

---

## Step 4: Deploy Client to GitHub Pages

1. Install gh-pages (if not already):
```bash
cd client
npm install gh-pages --save-dev
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

3. Enable GitHub Pages in your repo settings:
   - Go to **Settings** → **Pages**
   - Source: **gh-pages** branch
   - Save

Your game will be live at: `https://YOUR-USERNAME.github.io/snake-io-multiplayer/`

---

## 🎮 How Multiplayer Works

- Each game room has a unique URL with `?room=ROOM_ID`
- Share the URL with friends to join the same room
- Click "Share Room Link" in-game to copy the invite link

---

## Troubleshooting

**Server not connecting?**
- Check Railway deployment logs
- Ensure CORS is enabled in server
- Verify the production URL in `.env.production`

**GitHub Pages 404?**
- Check `vite.config.ts` has correct `base` path
- Wait a few minutes for deployment to propagate

**WebSocket errors?**
- Railway supports WebSockets by default
- Check browser console for specific errors
