# SmartHome IoT

Sistem Smart Home berbasis IoT dengan backend Node.js (REST API + WebSocket) dan firmware Arduino ESP32 untuk mengontrol perangkat relay secara real-time dengan fitur scheduling.

## Fitur

- **Autentikasi JWT** — Register, Login, dan Profile dengan token berlaku 7 hari
- **Manajemen Perangkat** — CRUD perangkat IoT dengan slot-based mapping ke relay ESP32
- **Kontrol Real-time** — Komunikasi WebSocket antara server dan ESP32 untuk ON/OFF instan
- **Scheduling** — Jadwal berulang (jam/menit/detik) menggunakan node-schedule
- **Multi-user** — Setiap user memiliki perangkat dan jadwal masing-masing
- **Auto-sync** — ESP32 menerima seluruh state perangkat saat pertama kali terhubung
- **Heartbeat** — Deteksi client mati setiap 30 detik via ping/pong
- **Swagger Docs** — Dokumentasi API otomatis di `/api-docs`

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Node.js, Express, WebSocket (ws) |
| Database | MySQL, Sequelize ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Scheduler | node-schedule |
| Docs | swagger-ui-express |
| Hardware | ESP32, ArduinoWebsockets 0.5.4, ArduinoJson 7.4.3 |

## Struktur Project

```
SmartHome/
├── Arduino/
│   ├── smart_home_v2/                  # Firmware ESP32 (versi terbaru)
│   ├── smart_home_websocket_v1_esp32/  # Firmware ESP32 (v1)
│   └── smart_home_websocket_v1_esp8266/ # Firmware ESP8266 (v1)
├── Backend/
│   ├── config/          # Konfigurasi database (env-based)
│   ├── controllers/     # Logic handler (auth, device, schedule)
│   ├── middlewares/     # JWT authentication middleware
│   ├── migrations/      # Sequelize migrations
│   ├── models/          # Sequelize models (User, Device, Schedule)
│   ├── routes/          # Express routes
│   ├── seeders/         # Database seeders
│   ├── index.js         # Entry point server
│   ├── swagger.json     # OpenAPI 3.0 documentation
│   └── .env             # Environment variables
└── README.md
```

## Instalasi & Setup

### Prasyarat

- Node.js v18+
- MySQL
- Arduino IDE (untuk upload firmware ke ESP32)

### 1. Clone Repository

```bash
git clone <repository-url>
cd SmartHome
```

### 2. Install Dependencies

```bash
cd Backend
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di folder `Backend/`:

```env
NODE_ENV=development
PORT=8080
JWT_SECRET=your-secret-key-change-this-in-production

# Database
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=db_smart_home_rcl_dev
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
```

> **Catatan:** Aplikasi akan gagal start jika `DB_USERNAME`, `DB_NAME`, `DB_HOST`, atau `DB_DIALECT` tidak diset.

### 4. Buat Database & Jalankan Migration

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### 5. Jalankan Server

```bash
npm run dev
```

Server berjalan di `http://localhost:8080`
Swagger docs di `http://localhost:8080/api-docs`

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Register user baru |
| POST | `/auth/login` | Login user |
| GET | `/auth/profile` | Ambil profil user (🔒) |

### Devices

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/devices` | Ambil semua perangkat (🔒) |
| POST | `/devices` | Tambah perangkat baru (🔒) |
| GET | `/devices/:id` | Ambil perangkat berdasarkan ID (🔒) |
| PUT | `/devices/:id` | Update perangkat (🔒) |
| DELETE | `/devices/:id` | Hapus perangkat (🔒) |
| POST | `/devices/status` | Update status & broadcast ke ESP32 (🔒) |

### Schedules

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/schedules` | Ambil semua jadwal aktif (🔒) |
| POST | `/schedules` | Buat jadwal baru (🔒) |
| DELETE | `/schedules/:id` | Hapus jadwal (🔒) |

> 🔒 = Memerlukan header `Authorization: Bearer <token>`

## WebSocket Protocol

Koneksi WebSocket di `ws://localhost:8080`

### ESP32 → Server (Register)

```json
{ "type": "register", "userId": 1 }
```

### Server → ESP32 (Sync saat connect)

```json
{
  "type": "sync",
  "devices": [
    { "slot": 1, "status": "true" },
    { "slot": 2, "status": "false" }
  ]
}
```

### Server → ESP32 (Command saat status berubah)

```json
{ "type": "command", "slot": 2, "status": "true" }
```

ESP32 memfilter berdasarkan slot number untuk mengontrol relay yang sesuai.

## Setup Arduino (ESP32)

1. Buka `Arduino/smart_home_v2/smart_home_v2.ino` di Arduino IDE
2. Install library:
   - **ArduinoWebsockets** v0.5.4
   - **ArduinoJson** v7.4.3
3. Sesuaikan konfigurasi di file `.ino`:

```cpp
// WiFi
const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";

// WebSocket Server
const char* ws_host = "192.168.x.x";  // IP server backend
const uint16_t ws_port = 8080;

// User ID
const int USER_ID = 1;

// Slot-to-Pin Mapping
const int slots[SLOT_COUNT] = {1, 2, 3, 4};
const int pins[SLOT_COUNT] = {12, 14, 4, 5};
```

4. Upload ke ESP32

## Environment Variables

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `NODE_ENV` | Tidak | Environment (development/test/production) |
| `PORT` | Tidak | Port server (default: 8080) |
| `JWT_SECRET` | Tidak | Secret key untuk JWT |
| `DB_USERNAME` | **Ya** | Username database |
| `DB_PASSWORD` | Tidak | Password database |
| `DB_NAME` | **Ya** | Nama database |
| `DB_HOST` | **Ya** | Host database |
| `DB_PORT` | Tidak | Port database (default: 3306) |
| `DB_DIALECT` | **Ya** | Dialect database (mysql) |

## License

ISC
