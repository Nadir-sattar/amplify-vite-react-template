#pragma once

// WiFi configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// AWS IoT Core configuration
const char* AWS_ENDPOINT = "YOUR_AWS_IOT_ENDPOINT";
const int AWS_PORT = 8883;

const char* CLIENT_ID = "motion-01";
const char* MQTT_TOPIC = "motion-01/telemetry";

// Amazon Root CA
const char* AWS_ROOT_CA = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_AMAZON_ROOT_CA
-----END CERTIFICATE-----
)EOF";

// Device certificate
const char* AWS_DEVICE_CERT = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_DEVICE_CERTIFICATE
-----END CERTIFICATE-----
)EOF";

// Device private key
const char* AWS_PRIVATE_KEY = R"EOF(
-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY
-----END PRIVATE KEY-----
)EOF";