#include <Arduino.h>
#include <Wire.h>
#include <NimBLEDevice.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

/* ===================== DEFINES ===================== */
#define BUILTIN_LED 2
#define BROCHE_MICRO 36

#define ADC_MAX 4095
#define VREF 3.3
#define SAMPLE_COUNT 500
#define REF_VOLTAGE 0.01  // référence arbitraire pour calculer les dB relatifs

// Strings en PROGMEM pour économiser la RAM
const char MSG_INIT[] PROGMEM = "Init ESP32 BLE + Sensor";
const char MSG_BMP_ERROR[] PROGMEM = "Can't find BMP280 device";
const char MSG_CONNECTED[] PROGMEM = "Client BLE connecté";
const char MSG_DISCONNECTED[] PROGMEM = "Client BLE déconnecté";
const char MSG_LED_ON[] PROGMEM = "LED allumée";
const char MSG_LED_OFF[] PROGMEM = "LED éteinte";
const char MSG_ADV_STARTED[] PROGMEM = "Advertising started";
const char MSG_SCANNING[] PROGMEM = "Scanning...";
const char MSG_I2C_FOUND[] PROGMEM = "I2C device found at address 0x";
const char MSG_I2C_ERROR[] PROGMEM = "Unknow error at address 0x";
const char MSG_NO_DEVICES[] PROGMEM = "No I2C devices found\n";
const char MSG_DONE[] PROGMEM = "done\n";

#define BMP_SDA 21
#define BMP_SCL 22

#define PIR_PIN 39

#define TRIG_PIN 5
#define ECHO_PIN 18
#define SOUND_SPEED 340
#define TRIG_PULSE_DURATION_US 10

#define SERVICE_ENV_UUID        "0d57fddd-b6d0-458d-a9e3-ede9919198d4"
#define CHAR_TEMP_UUID          "f1047d07-53c8-4877-9c5f-29f7161c516d"
#define CHAR_PRESSION_UIID      "79d4a577-2f8e-4b44-922a-b807b600eb80"
#define CHAR_SOUND_UUID         "cf5e24c5-9d6e-48bb-b256-bf0fdbfe0e05"
#define CHAR_DISTANCE_UUID      "67eec361-5161-489a-8492-ec27b8c7731e"
#define CHAR_PIR_UUID           "7a1d01a8-0234-4087-bc1d-077368a51172"

#define SERVICE_AUTOMATION_UUID "e4115b34-f55b-4e7b-9313-028bfcc5285f"
#define CHAR_LED_UUID           "3e92916e-15bd-4a65-abbd-b60b07b4e064"

#define DEVICE_NAME "EcoGuard_GrpX"

/* ===================== GLOBALS ===================== */
// Structure pour regrouper les données des capteurs
struct SensorData {
  float temperature = 20.0;
  float pressure = 0.0;
  float sound = 0.0;
  float distance = 0.0;
  bool motionDetected = false;
} sensorData;

bool deviceConnected = false;
bool scaning = true;

Adafruit_BMP280 bmp; // I2C

// Pointeurs BLE (réduisent la RAM par rapport à des objets complets)
NimBLEServer* pServer = nullptr;
NimBLEService* pEnvService = nullptr;
NimBLEService* pAutomationService = nullptr;
NimBLECharacteristic* pTempCharacteristic = nullptr;
NimBLECharacteristic* pPressionCharacteristic = nullptr;
NimBLECharacteristic* pSoundCharacteristic = nullptr;
NimBLECharacteristic* pDistanceCharacteristic = nullptr;
NimBLECharacteristic* pPIRCharacteristic = nullptr;
NimBLECharacteristic* pLEDCharacteristic = nullptr;

/* ===================== CALLBACKS ===================== */
class ServerCallbacks : public NimBLEServerCallbacks 
{
  void onConnect(NimBLEServer* pServer) override 
  {
    deviceConnected = true;
    Serial.println(FPSTR(MSG_CONNECTED));
  }

  void onDisconnect(NimBLEServer* pServer) override 
  {
      deviceConnected = false;
      Serial.println(FPSTR(MSG_DISCONNECTED));
      NimBLEDevice::getAdvertising()->start();
  }
};


class LEDCallbacks : public NimBLECharacteristicCallbacks 
{
  void onWrite(NimBLECharacteristic* pCharacteristic) override 
  {
    std::string value = pCharacteristic->getValue();
    if (value.empty()) return;

    uint8_t cmd = value[0];

    if (cmd == 0x01) 
    {
      digitalWrite(BUILTIN_LED, HIGH);
      Serial.println(FPSTR(MSG_LED_ON));
    } else if (cmd == 0x00) 
    {
      digitalWrite(BUILTIN_LED, LOW);
      Serial.println(FPSTR(MSG_LED_OFF));
    }
  }
};

// Instances statiques (créées une seule fois en mémoire)
static ServerCallbacks serverCallbacks;
static LEDCallbacks ledCallbacks;

float readMicRMS()
{
  uint32_t sum = 0;       // uint32_t suffisant pour la somme
  uint32_t sumSquares = 0; // uint32_t pour les carrés

  // Utiliser auto pour laisser le compilateur optimiser
  for (auto i = 0; i < SAMPLE_COUNT; i++) {
    uint16_t sample = analogRead(BROCHE_MICRO); // uint16_t au lieu de int
    sum += sample;
    sumSquares += (uint32_t)sample * sample;
    delayMicroseconds(100); // ≈10kHz
  }

  float mean = sum / (float)SAMPLE_COUNT;
  float rms = sqrt((sumSquares / (float)SAMPLE_COUNT) - (mean * mean));

  return rms;
}



/* ===================== SETUP ===================== */

void setup() 
{
  pinMode(BUILTIN_LED, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT); // On configure le trig en output
  pinMode(ECHO_PIN, INPUT); // On configure l'echo en input
  pinMode(PIR_PIN, INPUT);
  digitalWrite(BUILTIN_LED, LOW);


  Wire.begin();

  Serial.begin(115200);
  Serial.println(FPSTR(MSG_INIT));

  if(!bmp.begin(0x77))
  {
    Serial.println(FPSTR(MSG_BMP_ERROR));
    while (1);
  }

  /* Init NimBLE */
  NimBLEDevice::init(DEVICE_NAME);
  delay(100);
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);   // Puissance max (optionnel)

  pServer = NimBLEDevice::createServer();
  // Utiliser une instance statique au lieu de 'new'
  pServer->setCallbacks(&serverCallbacks);

  /* Services */
  pEnvService = pServer->createService(SERVICE_ENV_UUID);
  pAutomationService = pServer->createService(SERVICE_AUTOMATION_UUID);



  /* Température */
  pTempCharacteristic = pEnvService->createCharacteristic(
    CHAR_TEMP_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

  pPressionCharacteristic = pEnvService->createCharacteristic(
    CHAR_PRESSION_UIID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

  pSoundCharacteristic = pEnvService->createCharacteristic(
    CHAR_SOUND_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

  pDistanceCharacteristic = pEnvService->createCharacteristic(
    CHAR_DISTANCE_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

  pPIRCharacteristic = pEnvService->createCharacteristic(
    CHAR_PIR_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

  // Les descripteurs sont créés une seule fois et gérés par les caractéristiques
  pTempCharacteristic->addDescriptor(new NimBLE2904());
  ((NimBLE2904*)pTempCharacteristic->getDescriptorByUUID("2904"))->setFormat(NimBLE2904::FORMAT_FLOAT32);
  ((NimBLE2904*)pTempCharacteristic->getDescriptorByUUID("2904"))->setUnit(0x272F); // °C
  ((NimBLE2904*)pTempCharacteristic->getDescriptorByUUID("2904"))->setExponent(0);

  pPressionCharacteristic->addDescriptor(new NimBLE2904());
  ((NimBLE2904*)pPressionCharacteristic->getDescriptorByUUID("2904"))->setFormat(NimBLE2904::FORMAT_FLOAT32);
  ((NimBLE2904*)pPressionCharacteristic->getDescriptorByUUID("2904"))->setUnit(0x2781); // hPa
  ((NimBLE2904*)pPressionCharacteristic->getDescriptorByUUID("2904"))->setExponent(0);

  /* LED */
  pLEDCharacteristic = pAutomationService->createCharacteristic(
    CHAR_LED_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  // Utiliser une instance statique au lieu de 'new'
  pLEDCharacteristic->setCallbacks(&ledCallbacks);

  pEnvService->start();
  pAutomationService->start();

  /* Advertising */
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->setName(DEVICE_NAME);
  pAdvertising->setScanResponse(true);
  pAdvertising->addServiceUUID(SERVICE_ENV_UUID);
  pAdvertising->addServiceUUID(SERVICE_AUTOMATION_UUID);
  pAdvertising->start();

  Serial.println(FPSTR(MSG_ADV_STARTED));
}

/* ===================== LOOP ===================== */

void loop() 
{
  // Variables locales au lieu de globales - économise la RAM
  float adcRMS = readMicRMS();
  float voltsRMS = (adcRMS / ADC_MAX) * VREF;
  float dB = 20.0 * log10(voltsRMS / REF_VOLTAGE);

  // Capteur ultrason - variables locales
  uint32_t ultrason_duration; // uint32_t suffisant pour pulseIn
  float distance;

  // Prepare le signal
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  // Créer une impulsion de 10 µs
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(TRIG_PULSE_DURATION_US);
  digitalWrite(TRIG_PIN, LOW);

  // Renvoie le temps de propagation de l'onde (en µs)
  ultrason_duration = pulseIn(ECHO_PIN, HIGH);
  // Calcul de la distance
  distance = ultrason_duration * SOUND_SPEED / 2 * 0.0001;

  if(scaning)
  {
    byte error, address;
    int nDevices = 0;
    Serial.println(FPSTR(MSG_SCANNING));
    
    for(address = 1; address < 127; address++) {
      Wire.beginTransmission(address);
      error = Wire.endTransmission();
      if (error == 0) {
        Serial.print(FPSTR(MSG_I2C_FOUND));
        if (address < 16) {
          Serial.print("0");
        }
        Serial.println(address, HEX);
        nDevices++;
      }
      else if (error == 4) {
        Serial.print(FPSTR(MSG_I2C_ERROR));
        if (address < 16) {
          Serial.print("0");
        }
        Serial.println(address, HEX);
      }    
    }
    
    if (nDevices == 0) {
      Serial.println(FPSTR(MSG_NO_DEVICES));
    }
    else {
      Serial.println(FPSTR(MSG_DONE));
    }
    scaning = false;
  }

  // Remplir la structure avec les données des capteurs
  sensorData.temperature = bmp.readTemperature();
  sensorData.pressure = bmp.readPressure() / 100.0F; // Convert to hPa
  sensorData.sound = dB;  // Niveau sonore en dB
  sensorData.distance = distance;  // Distance en cm
  sensorData.motionDetected = digitalRead(PIR_PIN);  // Détection de mouvement
  
  if (deviceConnected && pTempCharacteristic->getSubscribedCount() > 0) 
  {
    pTempCharacteristic->setValue(sensorData.temperature);
    pTempCharacteristic->notify();
    pPressionCharacteristic->setValue(sensorData.pressure);
    pPressionCharacteristic->notify();
    pSoundCharacteristic->setValue(sensorData.sound);
    pSoundCharacteristic->notify();
    pDistanceCharacteristic->setValue(sensorData.distance);
    pDistanceCharacteristic->notify();
    pPIRCharacteristic->setValue(sensorData.motionDetected);
    pPIRCharacteristic->notify();
    
    // Printf avec format supporté pour ESP32
    char buffer[100];
    snprintf(buffer, sizeof(buffer), "BLE Notify : %.2f C, %.2f hPa, sound level = %.2f, distance = %.2f cm, motion = %d\n", 
             sensorData.temperature, sensorData.pressure, sensorData.sound, sensorData.distance, sensorData.motionDetected);
    Serial.print(buffer);
  }

  delay(2000);
}