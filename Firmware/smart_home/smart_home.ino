#include <WiFi.h>
// #include <ArduinoWebsockets.h> // Version - 0.5.4 - DIGANTI WebSocketsClient
#include <WebSocketsClient.h> // Version - 
#include <ArduinoJson.h> // Version - 7.4.3

// ========== CONFIGURATION ==========
// WiFi
const char* ssid = "Redmi Note 4x";
const char* password = "12344321";

// WebSocket Server
const char* ws_host = "smarthome-api.rizalscompanylab.my.id";
const uint16_t ws_port = 443;
const char* ws_path = "/";

// User ID (sesuaikan dengan user yang terdaftar di server)
const int USER_ID = 1;

// Slot-to-Pin Mapping
// Slot yang ditangani ESP32 ini dan GPIO pin-nya
// Contoh: ESP32 ini handle slot 1, 2, 3, 4
const int SLOT_COUNT = 4;
const int slots[SLOT_COUNT] = {1, 2, 3, 4};
const int pins[SLOT_COUNT] = {12, 14, 4, 5};

// Polarity (0 = normal, 1 = inverted/active-low)
// Normal: HIGH = ON, LOW = OFF
// Inverted: LOW = ON, HIGH = OFF (relay module active-low)
const int polarity[SLOT_COUNT] = {1, 1, 0, 0};

// Buzzer Pin
const int BUZZER_PIN = 23;

// ========== GLOBALS ==========
WebSocketsClient webSocket;

unsigned long lastReconnectAttempt = 0;
const unsigned long RECONNECT_INTERVAL = 5000;
bool isConnected = false;

// Buzzer state tracking
unsigned long wifiConnectStartTime = 0;   // Waktu mulai connecting WiFi
unsigned long wsConnectStartTime = 0;     // Waktu mulai connecting WebSocket
unsigned long lastWifiBeepTime = 0;       // Waktu terakhir beep WiFi
unsigned long lastWsBeepTime = 0;         // Waktu terakhir beep WebSocket
bool wifiWasConnected = false;            // Track status WiFi sebelumnya
bool wsWasConnected = false;              // Track status WebSocket sebelumnya

const unsigned long BEEP_FAST_INTERVAL = 3000;    // interval beep nya - sebelum melebihi threshold
const unsigned long BEEP_SLOW_INTERVAL = 300000;   // interval beep nya - setelah melebihi threshold
const unsigned long BEEP_THRESHOLD = 60000;      


// ========== BUZZER FUNCTIONS ==========

void beep(unsigned long duration) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration);
    digitalWrite(BUZZER_PIN, LOW);
}

// Beep beberapa kali dengan durasi dan jeda tertentu
void beepMultiple(int count, unsigned long duration, unsigned long gap) {
    for (int i = 0; i < count; i++) {
        beep(duration);
        if (i < count - 1) {
            delay(gap);
        }
    }
}

// Beep pendek 2 kali (startup & WiFi connected)
void beepTwice() {
    beepMultiple(2, 100, 100);
}

// Beep pendek 3 kali (WebSocket connected)
void beepThrice() {
    beepMultiple(3, 100, 100);
}

// Beep pendek 1 kali (connecting notification)
void beepOnce() {
    beep(100);
}

// Beep panjang 1 kali (WebSocket connecting notification)
void beepLong() {
    beep(500);
}


// ========== FUNCTIONS ==========

// Cari index berdasarkan slot number, return -1 jika tidak ditemukan
int findSlotIndex(int slot) {
    for (int i = 0; i < SLOT_COUNT; i++) {
        if (slots[i] == slot) {
            return i;
        }
    }
    return -1;
}

// Set relay berdasarkan slot dan status (memperhatikan polaritas)
void setRelay(int slot, bool state) {
    int idx = findSlotIndex(slot);
    if (idx == -1) {
        // Slot tidak ditangani ESP32 ini, abaikan
        return;
    }

    int pin = pins[idx];
    bool inverted = polarity[idx] == 1;

    // Jika inverted: ON = LOW, OFF = HIGH
    // Jika normal:   ON = HIGH, OFF = LOW
    if (inverted) {
        digitalWrite(pin, state ? LOW : HIGH);
    } else {
        digitalWrite(pin, state ? HIGH : LOW);
    }

    Serial.print("[Slot ");
    Serial.print(slot);
    Serial.print("] -> ");
    Serial.print(state ? "ON" : "OFF");
    Serial.println(inverted ? " (inverted)" : " (normal)");
}

// Handle message "sync" — set semua relay sesuai state dari server
void handleSync(JsonDocument& doc) {
    JsonArray devices = doc["devices"].as<JsonArray>();
    Serial.print("[SYNC] Received ");
    Serial.print(devices.size());
    Serial.println(" devices");

    for (JsonObject device : devices) {
        int slot = device["slot"];
        const char* statusStr = device["status"];
        bool state = (strcmp(statusStr, "true") == 0);
        setRelay(slot, state);
    }
}

// Handle message "command" — update satu relay
void handleCommand(JsonDocument& doc) {
    int slot = doc["slot"];
    const char* statusStr = doc["status"];
    bool state = (strcmp(statusStr, "true") == 0);

    Serial.print("[CMD] Slot: ");
    Serial.print(slot);
    Serial.print(" Status: ");
    Serial.println(statusStr);

    setRelay(slot, state);
}

// Handle message "error" dari server
void handleError(JsonDocument& doc) {
    const char* msg = doc["message"];
    Serial.print("[ERROR] ");
    Serial.println(msg);
}

void sendRegister() {
    JsonDocument doc;
    doc["type"] = "register";
    doc["userId"] = USER_ID;

    String payload;
    serializeJson(doc, payload);
    webSocket.sendTXT(payload);

    Serial.print("[WS] Sent register: ");
    Serial.println(payload);
}

// Event handler — ini menggantikan onMessageCallback + connect logic
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("[WS] Disconnected");
            isConnected = false;
            // Reset WebSocket connect timer saat disconnect (mulai ulang)
            if (wsWasConnected) {
                wsWasConnected = false;
                wsConnectStartTime = millis();
                lastWsBeepTime = 0;
                Serial.println("[BUZZER] WebSocket disconnected, memulai notif ulang");
            }
            break;

        case WStype_CONNECTED:
            Serial.println("[WS] Connected!");
            isConnected = true;
            wsWasConnected = true;
            // Beep 3 kali saat WebSocket connected
            delay(1000);
            beepThrice();
            Serial.println("[BUZZER] WebSocket connected - 3x beep");
            sendRegister();
            break;

        case WStype_TEXT: {
            Serial.print("[WS] Raw: ");
            Serial.println((char*)payload);

            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload, length);

            if (error) {
                Serial.print("[WS] JSON parse error: ");
                Serial.println(error.c_str());
                return;
            }

            const char* msgType = doc["type"];

            if (strcmp(msgType, "sync") == 0) {
                handleSync(doc);
            } else if (strcmp(msgType, "command") == 0) {
                handleCommand(doc);
            } else if (strcmp(msgType, "error") == 0) {
                handleError(doc);
            } else {
                Serial.print("[WS] Unknown type: ");
                Serial.println(msgType);
            }
            break;
        }

        case WStype_ERROR:
            Serial.println("[WS] Error event");
            break;

        default:
            break;
    }
}

// Konek ke WiFi (non-blocking version for reconnect)
void connectToWifi() {
    WiFi.begin(ssid, password);
    Serial.print("[WiFi] Connecting to ");
    Serial.println(ssid);
}


// ========== SETUP ==========
void setup() {
    Serial.begin(115200);
    Serial.println("\n[ESP32] Smart Home Client Starting...");
    Serial.print("[CONFIG] User ID: ");
    Serial.println(USER_ID);
    Serial.print("[CONFIG] Slots: ");
    for (int i = 0; i < SLOT_COUNT; i++) {
        Serial.print(slots[i]);
        if (i < SLOT_COUNT - 1) Serial.print(", ");
    }
    Serial.println();

    // Init buzzer pin
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    // Startup notification - 2 kali beep
    beepTwice();
    Serial.println("[BUZZER] Startup - 2x beep");

    // Init relay pins (set initial state = OFF sesuai polaritas)
    for (int i = 0; i < SLOT_COUNT; i++) {
        pinMode(pins[i], OUTPUT);
        // OFF state: normal = LOW, inverted = HIGH
        digitalWrite(pins[i], polarity[i] ? HIGH : LOW);
    }

    // Connect WiFi
    connectToWifi();
    wifiConnectStartTime = millis();
    lastWifiBeepTime = 0;

    // Tunggu WiFi connect (blocking di setup, max 10 detik)
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        Serial.print(".");
        delay(500);
        attempts++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("[WiFi] Connected! IP: ");
        Serial.println(WiFi.localIP());
        wifiWasConnected = true;

        // Beep 2 kali saat WiFi connected
        beepTwice();
        Serial.println("[BUZZER] WiFi connected - 2x beep");
        delay(1000);

        // Mulai WebSocket
        webSocket.beginSSL(ws_host, ws_port, ws_path);
        webSocket.onEvent(webSocketEvent);
        webSocket.setReconnectInterval(RECONNECT_INTERVAL);

        // Catat waktu mulai connecting WebSocket
        wsConnectStartTime = millis();
        lastWsBeepTime = 0;
    } else {
        Serial.println("[WiFi] Initial connection failed, will retry in loop...");
        wifiConnectStartTime = millis();
    }
}

// ========== LOOP ==========
void loop() {
    unsigned long now = millis();

    // === WiFi belum terkoneksi ===
    if (WiFi.status() != WL_CONNECTED) {
        // Reset flag jika sebelumnya sudah connected
        if (wifiWasConnected) {
            wifiWasConnected = false;
            wifiConnectStartTime = now;
            lastWifiBeepTime = 0;
            Serial.println("[BUZZER] WiFi lost, memulai notif ulang");
        }

        // Hitung elapsed time sejak mulai connecting
        unsigned long elapsed = now - wifiConnectStartTime;

        // Tentukan interval beep: < 5 menit = 5 detik, >= 5 menit = 1 menit
        unsigned long interval = (elapsed < BEEP_THRESHOLD) ? BEEP_FAST_INTERVAL : BEEP_SLOW_INTERVAL;

        // Beep 1 kali setiap interval
        if (now - lastWifiBeepTime >= interval) {
            lastWifiBeepTime = now;
            beepOnce();
            Serial.print("[BUZZER] WiFi connecting - 1x beep (interval: ");
            Serial.print(interval / 1000);
            Serial.println("s)");
        }

        // Coba reconnect setiap RECONNECT_INTERVAL
        if (now - lastReconnectAttempt >= RECONNECT_INTERVAL) {
            lastReconnectAttempt = now;
            Serial.println("[WiFi] Reconnecting...");
            connectToWifi();
        }
        return;
    }

    // === WiFi baru terkoneksi (transisi dari disconnect ke connect) ===
    if (!wifiWasConnected && WiFi.status() == WL_CONNECTED) {
        wifiWasConnected = true;
        Serial.print("[WiFi] Connected! IP: ");
        Serial.println(WiFi.localIP());

        // Beep 2 kali saat WiFi connected
        beepTwice();
        Serial.println("[BUZZER] WiFi connected - 2x beep");
        
        // Mulai WebSocket setelah WiFi connect
        webSocket.beginSSL(ws_host, ws_port, ws_path);
        webSocket.onEvent(webSocketEvent);
        webSocket.setReconnectInterval(RECONNECT_INTERVAL);

        wsConnectStartTime = millis();
        lastWsBeepTime = 0;
    }

    // === WebSocket loop ===
    webSocket.loop();

    // === WebSocket belum terkoneksi, beri notifikasi buzzer ===
    if (!isConnected) {
        unsigned long elapsed = now - wsConnectStartTime;

        // Tentukan interval: < 5 menit = 5 detik, >= 5 menit = 1 menit
        unsigned long interval = (elapsed < BEEP_THRESHOLD) ? BEEP_FAST_INTERVAL : BEEP_SLOW_INTERVAL;

        // Beep panjang 1 kali setiap interval
        if (now - lastWsBeepTime >= interval) {
            lastWsBeepTime = now;
            beepLong();
            Serial.print("[BUZZER] WebSocket connecting - 1x long beep (interval: ");
            Serial.print(interval / 1000);
            Serial.println("s)");
        }
    }
}
