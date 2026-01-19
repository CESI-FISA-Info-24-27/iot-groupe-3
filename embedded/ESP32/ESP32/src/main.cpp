#include<Arduino.h>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>  // Pour les notifications
#include <BLE2904.h>

#define BUILTIN_LED 2

#define SERVICE_ENV_UUID BLEUUID((uint16_t)0x181A)
#define CHAR_TEMP_UUID "f1047d07-53c8-4877-9c5f-29f7161c516d"

#define SERVICE_AUTOMATION_UUID BLEUUID((uint16_t)0x1815)
#define CHAR_LED_UUID BLEUUID((uint16_t)0x2A56)

//#define SERVICE_ENV_UUID "dc8d9a41-8f44-4c0b-8e2b-c9493449d2bd"
//#define CHAR_TEMP_UUID "f1047d07-53c8-4877-9c5f-29f7161c516d"

//#define SERVICE_AUTOMATION_UUID  "ca1e56c8-31b6-4746-ba87-1742270fcf2e"
//#define CHAR_LED_UUID "ab2cf69d-cbb6-4128-94d4-cc454136f97e"

#define DEVICE_NAME "EcoGuard_GrpX"

// Variables globales
float temperature = 20.0;
bool deviceConnected = false;

BLEServer* pServer = NULL;
BLEService* pEnvService = NULL;
BLEService* pAutomationService = NULL;
BLECharacteristic* pTempCharacteristic = NULL;
BLECharacteristic* pLEDCharacteristic = NULL;
BLEAdvertising* pAdvertising = NULL;
BLE2904* pFormat = NULL;

#define NOTIFY_CHARACTERISTIC

class ServerCallbacks : public BLEServerCallbacks 
{
    void onConnect(BLEServer* pServer) 
    {
        deviceConnected = true;
        Serial.println("Client BLE connecté");
    }

    void onDisconnect(BLEServer* pServer) 
    {
        deviceConnected = false;
        Serial.println("Client BLE déconnecté");
        // Redémarrer l'advertising pour permettre une nouvelle connexion
        BLEDevice::startAdvertising();
    }
};

class LEDCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic* pCharacteristic)
  {
    std::string value = pCharacteristic->getValue();

    uint8_t cmd = (uint8_t)value[0];

    switch (cmd) 
    {
      case 0x01:
        digitalWrite(BUILTIN_LED, HIGH);
        Serial.println("LED allumée");
        break;

      case 0x00:
        digitalWrite(BUILTIN_LED, LOW);
        Serial.println("LED éteinte");
        break;

      default:
        Serial.println("Commande LED inconnue");
    }
  }
};

void setup() 
{
  pinMode(BUILTIN_LED, OUTPUT);
  digitalWrite(BUILTIN_LED, LOW);

  Serial.begin(115200);
  Serial.println("Test BLE init server");

  BLEDevice::init(DEVICE_NAME);

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  pEnvService = pServer->createService(SERVICE_ENV_UUID);
  pAutomationService = pServer->createService(SERVICE_AUTOMATION_UUID);

  #ifdef NOTIFY_CHARACTERISTIC
  pTempCharacteristic = pEnvService->createCharacteristic(CHAR_TEMP_UUID,BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);
  pTempCharacteristic->addDescriptor(new BLE2902());
  #else
  pTempCharacteristic = pEnvService->createCharacteristic(CHAR_TEMP_UUID, BLECharacteristic::PROPERTY_READ);
  #endif

  pLEDCharacteristic = pAutomationService->createCharacteristic(CHAR_LED_UUID, BLECharacteristic::PROPERTY_WRITE);
  pLEDCharacteristic->setCallbacks(new LEDCallbacks());

  pFormat = new BLE2904();
  pFormat->setFormat(BLE2904::FORMAT_FLOAT32);
  pFormat->setUnit(0x272F); // °C
  pFormat->setExponent(0);
  pTempCharacteristic->addDescriptor(pFormat);

  pEnvService->start();
  pAutomationService->start();

  pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_ENV_UUID);
  pAdvertising->addServiceUUID(SERVICE_AUTOMATION_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("Test BLE start advertising");

  Serial.println("Test BLE wait connection");
}

void loop() 
{
  temperature += 0.5;

  if (temperature > 40.0) 
  {
      temperature = 20.0;
  }

  if (deviceConnected) 
  {
    pTempCharacteristic -> setValue(temperature);

    #ifdef NOTIFY_CHARACTERISTIC
    pTempCharacteristic->notify();
    #endif
    delay(10);//Pour éviter la congestion du Bluetooth

    String datas(temperature);
    Serial.printf("BLE Notify : %.2f\n", temperature);
    // TODO: Mettre à jour la température
    // TODO: Notifier le client
    delay(2000);
  }
}