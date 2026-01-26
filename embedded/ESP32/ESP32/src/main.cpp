#include <Arduino.h>
#include <NimBLEDevice.h>

#define BUILTIN_LED 2

#define SERVICE_ENV_UUID        "181A"
#define CHAR_TEMP_UUID          "f1047d07-53c8-4877-9c5f-29f7161c516d"

#define SERVICE_AUTOMATION_UUID "1815"
#define CHAR_LED_UUID           "2A56"

#define DEVICE_NAME "EcoGuard_GrpX"

float temperature = 20.0;
bool deviceConnected = false;

NimBLEServer* pServer = nullptr;
NimBLEService* pEnvService = nullptr;
NimBLEService* pAutomationService = nullptr;
NimBLECharacteristic* pTempCharacteristic = nullptr;
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



/* ===================== SETUP ===================== */

void setup() 
{
  pinMode(BUILTIN_LED, OUTPUT);
  digitalWrite(BUILTIN_LED, LOW);

  Serial.begin(115200);
  Serial.println("Init BLE NimBLE");

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

  // Descriptor 0x2904 (Characteristic Presentation Format)
  NimBLE2904* pFormat = new NimBLE2904();
  pFormat->setFormat(NimBLE2904::FORMAT_FLOAT32);
  pFormat->setUnit(0x272F); // °C
  pFormat->setExponent(0);
  pTempCharacteristic->addDescriptor(pFormat);

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
  pAdvertising->start();

  Serial.println("Advertising started");
}

/* ===================== LOOP ===================== */

void loop() 
{
  temperature += 0.5;
  if (temperature > 40.0) temperature = 20.0;

  if (deviceConnected && pTempCharacteristic->getSubscribedCount() > 0) 
  {
    pTempCharacteristic->setValue(temperature);
    pTempCharacteristic->notify();
    Serial.printf("BLE Notify : %.2f\n", temperature);
  }

  delay(2000);
}