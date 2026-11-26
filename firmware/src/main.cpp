#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "secrets.h"

#define PIR_PIN 27

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

int previousState = -1;

void connectWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nWiFi connected!");
    Serial.println(WiFi.localIP());
}

void syncTime() {
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");

    Serial.print("Synchronizing time");

    while (time(nullptr) < 1700000000) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nTime synchronized!");
}

void connectAWS() {
    secureClient.setCACert(AWS_ROOT_CA);
    secureClient.setCertificate(AWS_DEVICE_CERT);
    secureClient.setPrivateKey(AWS_PRIVATE_KEY);

    mqttClient.setServer(AWS_ENDPOINT, AWS_PORT);

    Serial.print("Connecting to AWS IoT");

    while (!mqttClient.connected()) {
        if (mqttClient.connect(CLIENT_ID)) {
            Serial.println("\nAWS IoT connected!");
        } else {
            Serial.print("\nConnection failed. State: ");
            Serial.println(mqttClient.state());
            delay(3000);
        }
    }
}

void publishMotion(int motion) {
    JsonDocument doc;

    doc["deviceName"] = CLIENT_ID;
    doc["motion"] = (motion == HIGH);
    doc["timestamp"] = String((unsigned long)time(nullptr));

    char payload[256];

    serializeJson(doc, payload);

    if (mqttClient.publish(MQTT_TOPIC, payload)) {
        Serial.print("Published: ");
        Serial.println(payload);
        previousState = motion;
    } else {
        Serial.println("Publish failed!");
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(PIR_PIN, INPUT);

    connectWiFi();
    syncTime();

    Serial.println("Calibrating PIR sensor...");
    delay(60000);

    connectAWS();

    Serial.println("Motion Monitor ready!");
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }

    if (!mqttClient.connected()) {
        connectAWS();
        previousState = -1;
    }

    mqttClient.loop();

    int motion = digitalRead(PIR_PIN);

    if (motion != previousState) {
        publishMotion(motion);
    }

    delay(100);
}