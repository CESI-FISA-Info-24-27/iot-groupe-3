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


#define BMP_SDA 21
#define BMP_SCL 22

#define SERVICE_ENV_UUID        "0d57fddd-b6d0-458d-a9e3-ede9919198d4"
#define CHAR_TEMP_UUID          "f1047d07-53c8-4877-9c5f-29f7161c516d"
#define CHAR_PRESSION_UIID      "79d4a577-2f8e-4b44-922a-b807b600eb80"
#define CHAR_SOUND_UUID         "cf5e24c5-9d6e-48bb-b256-bf0fdbfe0e05"

#define SERVICE_AUTOMATION_UUID "e4115b34-f55b-4e7b-9313-028bfcc5285f"
#define CHAR_LED_UUID           "3e92916e-15bd-4a65-abbd-b60b07b4e064"

#define DEVICE_NAME "EcoGuard_GrpX"

/* ===================== GLOBALS ===================== */
float temperature = 20.0;
float pressure = 00.0;
unsigned int sample;
bool deviceConnected = false;
bool scaning = true;

Adafruit_BMP280 bmp; // I2C

NimBLEServer* pServer = nullptr;
NimBLEService* pEnvService = nullptr;
NimBLEService* pAutomationService = nullptr;
NimBLECharacteristic* pTempCharacteristic = nullptr;
NimBLECharacteristic* pPressionCharacteristic = nullptr;
NimBLECharacteristic* pSoundCharacteristic = nullptr;
NimBLECharacteristic* pLEDCharacteristic = nullptr;

/* ===================== CALLBACKS ===================== */
class ServerCallbacks : public NimBLEServerCallbacks 
{
  void onConnect(NimBLEServer* pServer) override 
  {
    deviceConnected = true;
    Serial.println("Client BLE connecté");
  }

  void onDisconnect(NimBLEServer* pServer) override 
  {
      deviceConnected = false;
      Serial.println("Client BLE déconnecté");
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
      Serial.println("LED allumée");
    } else if (cmd == 0x00) 
    {
      digitalWrite(BUILTIN_LED, LOW);
      Serial.println("LED éteinte");
    }
  }
};

float readMicRMS()
{
  long sum = 0;
  long sumSquares = 0;

  for (int i = 0; i < SAMPLE_COUNT; i++) {
    int sample = analogRead(BROCHE_MICRO);
    sum += sample;
    sumSquares += (long)sample * sample;
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
  digitalWrite(BUILTIN_LED, LOW);

  Wire.begin();

  Serial.begin(115200);
  Serial.println("Init ESP32 BLE + Sensor");

  if(!bmp.begin(0x77))
  {
    Serial.println("Can't find BMP280 device");
    while (1);
  }

  /* Init NimBLE */
  NimBLEDevice::init(DEVICE_NAME);
  delay(100);
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);   // Puissance max (optionnel)

  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

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

  // Descriptor 0x2904 (Characteristic Presentation Format)
  NimBLE2904* pFormat = new NimBLE2904();
  pFormat->setFormat(NimBLE2904::FORMAT_FLOAT32);
  pFormat->setUnit(0x272F); // °C
  pFormat->setExponent(0);
  pTempCharacteristic->addDescriptor(pFormat);

  // Descriptor 0x2904 (Characteristic Presentation Format)
  NimBLE2904* pFormat2 = new NimBLE2904();
  pFormat2->setFormat(NimBLE2904::FORMAT_FLOAT32);
  pFormat2->setUnit(0x2781); // hPa
  pFormat2->setExponent(0);
  pPressionCharacteristic->addDescriptor(pFormat2);

  /* LED */
  pLEDCharacteristic = pAutomationService->createCharacteristic(
    CHAR_LED_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  pLEDCharacteristic->setCallbacks(new LEDCallbacks());

  pEnvService->start();
  pAutomationService->start();

  /* Advertising */
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->setName(DEVICE_NAME);
  pAdvertising->setScanResponse(true);
  pAdvertising->addServiceUUID(SERVICE_ENV_UUID);
  pAdvertising->addServiceUUID(SERVICE_AUTOMATION_UUID);
  pAdvertising->start();

  Serial.println("Advertising started");
}

/* ===================== LOOP ===================== */

void loop() 
{
  float adcRMS = readMicRMS();
  float voltsRMS = (adcRMS / ADC_MAX) * VREF;

  float dB = 20.0 * log10(voltsRMS / REF_VOLTAGE);

  if(scaning)
  {
    byte error, address;
    int nDevices;
    Serial.println("Scanning...");
    nDevices = 0;
    for(address = 1; address < 127; address++ ) {
      Wire.beginTransmission(address);
      error = Wire.endTransmission();
      if (error == 0) {
        Serial.print("I2C device found at address 0x");
        if (address<16) {
          Serial.print("0");
        }
        Serial.println(address,HEX);
        nDevices++;
      }
      else if (error==4) {
        Serial.print("Unknow error at address 0x");
        if (address<16) {
          Serial.print("0");
        }
        Serial.println(address,HEX);
      }    
    }
    if (nDevices == 0) {
      Serial.println("No I2C devices found\n");
      scaning = false;
    }
    else {
      Serial.println("done\n");
      scaning = false;
    }
  }

  temperature = bmp.readTemperature();
  pressure = bmp.readPressure() / 100.0F; // Convert to hPa
  sample = analogRead(BROCHE_MICRO);


  if (deviceConnected && pTempCharacteristic->getSubscribedCount() > 0) 
  {
    pTempCharacteristic->setValue(temperature);
    pTempCharacteristic->notify();
    pPressionCharacteristic->setValue(pressure);
    pPressionCharacteristic->notify();
    pSoundCharacteristic->setValue(dB);
    pSoundCharacteristic->notify();
    Serial.printf("BLE Notify : %.2f °C, %.2f hPa, sound level = %.2f \n", temperature, pressure, dB);
  }

  delay(2000);
}