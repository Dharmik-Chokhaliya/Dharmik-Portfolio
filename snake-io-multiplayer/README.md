# 🐍 Snake.io Multiplayer

> Real-time multiplayer snake game with bots, power-ups, and customizable skins.
> 
> Gerçek zamanlı çok oyunculu yılan oyunu - botlar, güçlendirmeler ve özelleştirilebilir görünümler.

[🇬🇧 English](#english) | [🇹🇷 Türkçe](#türkçe)

---

## English

### 🎮 Features

- ✅ **Real-time Multiplayer** - Play with friends via WebSocket
- ✅ **AI Bots** - 5 intelligent bots for solo practice
- ✅ **Skin System** - 8 patterns × 10 colors = 80 combinations
- ✅ **Power-ups** - Shield, Speed, Magnet, Slow Others
- ✅ **Mobile Support** - Touch controls with visual indicator
- ✅ **Leaderboard** - Real-time rankings
- ✅ **Smooth Gameplay** - 30Hz server tick rate, 60 FPS client

### 🚀 Quick Start (Local)

#### Prerequisites
- Node.js 18+ and npm

#### 1. Clone Repository
```bash
git clone https://github.com/m0Corut/snake-io-multiplayer.git
cd snake-io-multiplayer
```

#### 2. Start Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:3001
```

#### 3. Start Client (New Terminal)
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173/snake-io-multiplayer/
```

#### 4. Play!
Open `http://localhost:5173/snake-io-multiplayer/` in your browser.

---

### 🌐 Online Deployment

For production deployment, see [DEPLOY.md](./DEPLOY.md).

**Recommended Free Hosting:**
- **Fly.io** (Server) - Always-on, no sleep mode
- **GitHub Pages** (Client) - Static hosting

**Alternative Options:**
- Render.com (Server) - 15min sleep mode
- Railway (Server) - Limited free tier

---

### 📁 Project Structure

```
snake-io-multiplayer/
├── client/                 # Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── game/          # Game logic
│   │   │   ├── Game.ts           # Main game loop
│   │   │   ├── Renderer.ts       # Canvas rendering
│   │   │   ├── Camera.ts         # Viewport management
│   │   │   └── Input.ts          # Mouse/touch controls
│   │   ├── network/       # Socket.io client
│   │   ├── ui/            # Skin selector
│   │   └── main.ts        # Entry point
│   ├── index.html         # HTML structure
│   ├── style.css          # Styling
│   └── vite.config.ts     # Build configuration
│
├── server/                # Backend (Node.js + Express)
│   └── src/
│       ├── game/          # Game server logic
│       │   ├── GameServer.ts     # Main game loop & physics
│       │   └── BotController.ts  # AI logic
│       ├── network/       # Socket.io server
│       └── index.ts       # Entry point
│
└── shared/                # Shared types (TypeScript)
    └── types.ts           # Game constants & interfaces
```

---

### 🛠️ Key Files Explained

#### Client

| File | Purpose |
|------|---------|
| `Game.ts` | Main game loop, state management, socket event handlers |
| `Renderer.ts` | Canvas drawing (snakes, food, power-ups, grid) |
| `Camera.ts` | Viewport tracking (follows player) |
| `Input.ts` | Mouse/touch input handling |
| `SocketClient.ts` | WebSocket communication with server |

#### Server

| File | Purpose |
|------|---------|
| `GameServer.ts` | Game physics, collision detection, state updates |
| `BotController.ts` | AI pathfinding and decision-making |
| `SocketHandler.ts` | WebSocket event routing |
| `index.ts` | Express server setup, CORS configuration |

#### Shared

| File | Purpose |
|------|---------|
| `types.ts` | Game constants (speed, world size, tick rate), TypeScript interfaces |

---

### ⚙️ Configuration

#### Server (`shared/types.ts`)

| Constant | Description | Default |
|----------|-------------|---------|
| `SERVER_TICK_RATE` | Server update frequency (Hz) | 30 |
| `WORLD_WIDTH/HEIGHT` | Game world size (pixels) | 3000×3000 |
| `INITIAL_SNAKE_SPEED` | Base movement speed | 6 |
| `FOOD_COUNT` | Number of food items | 300 |
| `BOT_COUNT` | Number of AI bots | 5 |

#### Client (`client/src/main.ts`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_URL` | WebSocket server address | `http://localhost:3001` |

---

### 🎨 Customization

#### Add New Skin Pattern

1. Open `shared/types.ts`
2. Add pattern to `SkinPattern` type:
   ```typescript
   export type SkinPattern = 
     | 'solid' | 'gradient' | 'striped' | 'dotted' 
     | 'neon' | 'rainbow' | 'camo' | 'galaxy'
     | 'your-pattern'; // Add here
   ```
3. Implement rendering in `client/src/game/Renderer.ts`

#### Adjust Game Speed

Edit `shared/types.ts`:
```typescript
INITIAL_SNAKE_SPEED: 6,        // Increase for faster gameplay
BOOST_SPEED_MULTIPLIER: 2.0,   // Boost acceleration
```

#### Change World Size

Edit `shared/types.ts`:
```typescript
WORLD_WIDTH: 3000,   // Increase for larger map
WORLD_HEIGHT: 3000,
```

---

### 🐛 Troubleshooting

**Problem:** "Cannot connect to server"
- **Solution:** Ensure server is running on port 3001. Check `SERVER_URL` in `client/src/main.ts`.

**Problem:** Game freezes on PC but works on mobile
- **Solution:** Clear browser cache (Ctrl+Shift+R) or disable Service Worker (F12 → Application → Service Workers → Unregister).

**Problem:** Slow gameplay / lag
- **Solution:** If using Railway/Render free tier, server may be throttled. Consider Fly.io or local hosting.

---

### 📜 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## Türkçe

### 🎮 Özellikler

- ✅ **Gerçek Zamanlı Çok Oyunculu** - WebSocket ile arkadaşlarınla oyna
- ✅ **Yapay Zeka Botları** - Solo pratik için 5 akıllı bot
- ✅ **Görünüm Sistemi** - 8 desen × 10 renk = 80 kombinasyon
- ✅ **Güçlendirmeler** - Kalkan, Hız, Mıknatıs, Diğerlerini Yavaşlat
- ✅ **Mobil Destek** - Görsel gösterge ile dokunmatik kontroller
- ✅ **Lider Tablosu** - Gerçek zamanlı sıralama
- ✅ **Akıcı Oynanış** - 30Hz sunucu, 60 FPS istemci

### 🚀 Hızlı Başlangıç (Lokal)

#### Gereksinimler
- Node.js 18+ ve npm

#### 1. Depoyu Klonla
```bash
git clone https://github.com/m0Corut/snake-io-multiplayer.git
cd snake-io-multiplayer
```

#### 2. Sunucuyu Başlat
```bash
cd server
npm install
npm run dev
# Sunucu http://localhost:3001 adresinde çalışır
```

#### 3. İstemciyi Başlat (Yeni Terminal)
```bash
cd client
npm install
npm run dev
# İstemci http://localhost:5173/snake-io-multiplayer/ adresinde çalışır
```

#### 4. Oyna!
Tarayıcında `http://localhost:5173/snake-io-multiplayer/` adresini aç.

---

### 🌐 Online Yayınlama

Üretim ortamı için [DEPLOY.md](./DEPLOY.md) dosyasına bakın.

**Önerilen Ücretsiz Hosting:**
- **Fly.io** (Sunucu) - Her zaman açık, uyku modu yok
- **GitHub Pages** (İstemci) - Statik hosting

**Alternatif Seçenekler:**
- Render.com (Sunucu) - 15dk uyku modu
- Railway (Sunucu) - Sınırlı ücretsiz plan

---

### 📁 Proje Yapısı

```
snake-io-multiplayer/
├── client/                 # Ön yüz (Vite + TypeScript)
│   ├── src/
│   │   ├── game/          # Oyun mantığı
│   │   │   ├── Game.ts           # Ana oyun döngüsü
│   │   │   ├── Renderer.ts       # Canvas çizimi
│   │   │   ├── Camera.ts         # Görüntü alanı yönetimi
│   │   │   └── Input.ts          # Fare/dokunmatik kontroller
│   │   ├── network/       # Socket.io istemcisi
│   │   ├── ui/            # Görünüm seçici
│   │   └── main.ts        # Giriş noktası
│   ├── index.html         # HTML yapısı
│   ├── style.css          # Stil
│   └── vite.config.ts     # Derleme ayarları
│
├── server/                # Arka yüz (Node.js + Express)
│   └── src/
│       ├── game/          # Oyun sunucusu mantığı
│       │   ├── GameServer.ts     # Ana oyun döngüsü & fizik
│       │   └── BotController.ts  # Yapay zeka mantığı
│       ├── network/       # Socket.io sunucusu
│       └── index.ts       # Giriş noktası
│
└── shared/                # Paylaşılan tipler (TypeScript)
    └── types.ts           # Oyun sabitleri & arayüzler
```

---

### 🛠️ Önemli Dosyalar

#### İstemci

| Dosya | Amacı |
|-------|-------|
| `Game.ts` | Ana oyun döngüsü, durum yönetimi, socket olay işleyicileri |
| `Renderer.ts` | Canvas çizimi (yılanlar, yemler, güçlendirmeler, ızgara) |
| `Camera.ts` | Görüntü alanı takibi (oyuncuyu takip eder) |
| `Input.ts` | Fare/dokunmatik girdi işleme |
| `SocketClient.ts` | Sunucu ile WebSocket iletişimi |

#### Sunucu

| Dosya | Amacı |
|-------|-------|
| `GameServer.ts` | Oyun fiziği, çarpışma tespiti, durum güncellemeleri |
| `BotController.ts` | Yapay zeka yol bulma ve karar verme |
| `SocketHandler.ts` | WebSocket olay yönlendirme |
| `index.ts` | Express sunucu kurulumu, CORS yapılandırması |

#### Paylaşılan

| Dosya | Amacı |
|-------|-------|
| `types.ts` | Oyun sabitleri (hız, dünya boyutu, tick oranı), TypeScript arayüzleri |

---

### ⚙️ Yapılandırma

#### Sunucu (`shared/types.ts`)

| Sabit | Açıklama | Varsayılan |
|-------|----------|------------|
| `SERVER_TICK_RATE` | Sunucu güncelleme frekansı (Hz) | 30 |
| `WORLD_WIDTH/HEIGHT` | Oyun dünyası boyutu (piksel) | 3000×3000 |
| `INITIAL_SNAKE_SPEED` | Temel hareket hızı | 6 |
| `FOOD_COUNT` | Yem sayısı | 300 |
| `BOT_COUNT` | Yapay zeka bot sayısı | 5 |

#### İstemci (`client/src/main.ts`)

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `SERVER_URL` | WebSocket sunucu adresi | `http://localhost:3001` |

---

### 🎨 Özelleştirme

#### Yeni Görünüm Deseni Ekle

1. `shared/types.ts` dosyasını aç
2. `SkinPattern` tipine desen ekle:
   ```typescript
   export type SkinPattern = 
     | 'solid' | 'gradient' | 'striped' | 'dotted' 
     | 'neon' | 'rainbow' | 'camo' | 'galaxy'
     | 'senin-desenin'; // Buraya ekle
   ```
3. `client/src/game/Renderer.ts` dosyasında çizimi uygula

#### Oyun Hızını Ayarla

`shared/types.ts` dosyasını düzenle:
```typescript
INITIAL_SNAKE_SPEED: 6,        // Daha hızlı oyun için artır
BOOST_SPEED_MULTIPLIER: 2.0,   // Hızlanma çarpanı
```

#### Dünya Boyutunu Değiştir

`shared/types.ts` dosyasını düzenle:
```typescript
WORLD_WIDTH: 3000,   // Daha büyük harita için artır
WORLD_HEIGHT: 3000,
```

---

### 🐛 Sorun Giderme

**Sorun:** "Sunucuya bağlanılamıyor"
- **Çözüm:** Sunucunun 3001 portunda çalıştığından emin ol. `client/src/main.ts` içindeki `SERVER_URL`'i kontrol et.

**Sorun:** Oyun PC'de donuyor ama mobilde çalışıyor
- **Çözüm:** Tarayıcı önbelleğini temizle (Ctrl+Shift+R) veya Service Worker'ı devre dışı bırak (F12 → Application → Service Workers → Unregister).

**Sorun:** Yavaş oynanış / gecikme
- **Çözüm:** Railway/Render ücretsiz planı kullanıyorsan, sunucu kısıtlanmış olabilir. Fly.io veya lokal hosting düşün.

---

### 📜 Lisans

MIT Lisansı - Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

---

**Made with ❤️ by m0Corut**
