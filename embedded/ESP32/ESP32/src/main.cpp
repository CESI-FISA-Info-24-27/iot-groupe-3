#include <Arduino.h>
#include <Wire.h>
#include <pitches.h>
#include <NimBLEDevice.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

/* ===================== DEFINES ===================== */
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
const char MSG_ADV_STARTED[] PROGMEM = "Advertising started";
const char MSG_DONE[] PROGMEM = "done\n";

const int SPEAKER_PIN = 27;  // Broche PWM pour le speaker
const int notes[] = {131, 147, 165, 175, 196, 220, 247};

// Nyan Cat (simplified snippet)
int melody[] = {
  NOTE_DS5, NOTE_E5, NOTE_FS5, 0, NOTE_B5, NOTE_E5, NOTE_DS5, NOTE_E5, NOTE_FS5, NOTE_B5, NOTE_DS6, NOTE_E6, NOTE_DS6, NOTE_AS5, NOTE_B5, 0,
  NOTE_FS5, 0, NOTE_DS5, NOTE_E5, NOTE_FS5, 0, NOTE_B5, NOTE_CS6, NOTE_AS5, NOTE_B5, NOTE_CS6, NOTE_E6, NOTE_DS6, NOTE_E6, NOTE_CS6,
  NOTE_FS4, NOTE_GS4, NOTE_D4, NOTE_DS4, NOTE_FS2, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_CS4, NOTE_B3,
  NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_D4, NOTE_DS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_FS4, NOTE_GS4, NOTE_D4, NOTE_DS4, NOTE_FS2, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_CS4, NOTE_B3,
  NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_D4, NOTE_DS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_B3, NOTE_B3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4,
  NOTE_B3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_E4, NOTE_DS4, NOTE_CS4, NOTE_B3, NOTE_E3, NOTE_DS3, NOTE_E3, NOTE_FS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_FS3,
  NOTE_B3, NOTE_B3, NOTE_AS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4, NOTE_B3, NOTE_AS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4,
  NOTE_B3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_E4, NOTE_DS4, NOTE_CS4, NOTE_B3, NOTE_E3, NOTE_DS3, NOTE_E3, NOTE_FS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_FS3,
  NOTE_B3, NOTE_B3, NOTE_AS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4, NOTE_B3, NOTE_CS4,
  NOTE_FS4, NOTE_GS4, NOTE_D4, NOTE_DS4, NOTE_FS2, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_CS4, NOTE_B3,
  NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_D4, NOTE_DS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_FS4, NOTE_GS4, NOTE_D4, NOTE_DS4, NOTE_FS2, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_CS4, NOTE_B3,
  NOTE_DS4, NOTE_FS4, NOTE_GS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_D4, NOTE_DS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4,
  NOTE_D4, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_FS4, NOTE_CS4, NOTE_D4, NOTE_CS4, NOTE_B3, NOTE_CS4, NOTE_B3, NOTE_B3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4,
  NOTE_B3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_E4, NOTE_DS4, NOTE_CS4, NOTE_B3, NOTE_E3, NOTE_DS3, NOTE_E3, NOTE_FS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_FS3,
  NOTE_B3, NOTE_B3, NOTE_AS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4, NOTE_B3, NOTE_AS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4,
  NOTE_B3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_E4, NOTE_DS4, NOTE_CS4, NOTE_B3, NOTE_E3, NOTE_DS3, NOTE_E3, NOTE_FS3,
  NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_B3, NOTE_CS4, NOTE_DS4, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_FS3,
  NOTE_B3, NOTE_B3, NOTE_AS3, NOTE_B3, NOTE_FS3, NOTE_GS3, NOTE_B3, NOTE_E4, NOTE_DS4, NOTE_E4, NOTE_FS4, NOTE_B3, NOTE_CS4,
};

int noteDurations[] = {
  16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,
  16,16,16,16,16,16,8,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,8,8,8,
  8,16,16,16,16,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,8,8,8,
  8,8,16,16,16,16,16,16,8,8,8,
  8,16,16,16,16,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,8,8,8,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,16,16,8,8,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,16,16,8,8,
  8,8,16,16,16,16,16,16,8,8,8,
  8,16,16,16,16,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,8,8,8,
  8,8,16,16,16,16,16,16,8,8,8,
  8,16,16,16,16,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,8,8,8,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,16,16,8,8,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,8,16,16,16,16,16,16,16,16,16,16,16,16,
  8,16,16,8,16,16,16,16,16,16,16,16,16,16,
  8,16,16,16,16,16,16,16,16,16,16,8,8,
};

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

#define SERVICE_AUTOMATION_UUID       "e4115b34-f55b-4e7b-9313-028bfcc5285f"
#define CHAR_ALARM_MODE_UUID          "65fd3587-3516-4af9-8f30-160c005f1170"
#define CHAR_ALARM_PLAYING_UUID       "f93c7fe3-5f42-4556-9110-6afc288afdc1"

#define DEVICE_NAME "EcoGuard_GrpX"

// Intervalles d'envoi pour chaque capteur (en ms)
#define TEMP_INTERVAL 10000      // Température tous les 2s
#define PRESSURE_INTERVAL 10000  // Pression tous les 2s
#define SOUND_INTERVAL 200      // Son tous les 0.2s
#define DISTANCE_INTERVAL 200   // Distance tous les 0.2s
#define PIR_INTERVAL 200        // PIR tous les 0.2s

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

// Variables pour le système asynchrone (derniers temps d'envoi)
unsigned long lastTempSend = 0;
unsigned long lastPressureSend = 0;
unsigned long lastSoundSend = 0;
unsigned long lastDistanceSend = 0;
unsigned long lastPIRSend = 0;
// État précédent du PIR pour détecter les fronts montants (mouvement détecté)
bool prevMotionState = false;

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
NimBLECharacteristic* pAlarmModeCharacteristic = nullptr;
NimBLECharacteristic* pAlarmPlayingCharacteristic = nullptr;

// Forward declarations
bool ALARM_ON = false;
bool ALARM_PLAYING = false;
void stopNyanCat();

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


class AlarmModeCallbacks : public NimBLECharacteristicCallbacks 
{
  void onWrite(NimBLECharacteristic* pCharacteristic) override 
  {
    std::string value = pCharacteristic->getValue();
    if (value.empty()) return;

    uint8_t cmd = value[0];

    if (cmd == 0x01) 
    {
      ALARM_ON = true;
      pAlarmModeCharacteristic->setValue(ALARM_ON); // Update characteristic value to reflect alarm state
      pAlarmModeCharacteristic->notify();           // Notify clients of the change
    } 
    else if (cmd == 0x00) 
    {
      ALARM_ON = false;
      pAlarmModeCharacteristic->setValue(ALARM_ON); // Update characteristic value to reflect alarm state
      pAlarmModeCharacteristic->notify();           // Notify clients of the change
    }
  }
};

// Instances statiques (créées une seule fois en mémoire)
static ServerCallbacks serverCallbacks;
static AlarmModeCallbacks alarmModeCallbacks;

// Non-blocking alarm player state
int nyanIndex = 0;
unsigned long nyanNoteStart = 0;
unsigned long nyanNoteDuration = 0;
const int nyanChannel = 0; // must match ledcSetup channel used in setup()

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

// Non-blocking NyanCat player using LEDC tone (driven from loop())
void startNyanCat()
{
  if (ALARM_PLAYING) return; // already playing
  ALARM_PLAYING = true;    
  
  pAlarmPlayingCharacteristic->setValue(ALARM_PLAYING); // Update characteristic value to reflect alarm playing state
  pAlarmPlayingCharacteristic->notify();                 // Notify clients of the change
  
  nyanIndex = 0;
  nyanNoteStart = millis();
  // If first note is a tone, start it immediately
  int freq = melody[nyanIndex];
  if (freq > 0) ledcWriteTone(nyanChannel, freq);
  else ledcWriteTone(nyanChannel, 0);
  nyanNoteDuration = 1000 / noteDurations[nyanIndex];
}

void stopNyanCat()
{
  ALARM_PLAYING = false;

  pAlarmPlayingCharacteristic->setValue(ALARM_PLAYING); // Update characteristic value to reflect alarm playing state
  pAlarmPlayingCharacteristic->notify();                 // Notify clients of the change

  nyanIndex = 0;
  nyanNoteStart = 0;
  nyanNoteDuration = 0;
  ledcWriteTone(nyanChannel, 0);
}

void updateNyanCat(unsigned long currentMillis)
{
  if (!ALARM_PLAYING) return;
  if (!ALARM_ON) 
  {
    stopNyanCat();
    return;
  }
  if (currentMillis - nyanNoteStart < nyanNoteDuration) return;

  // Move to next note
  nyanIndex++;
  if (nyanIndex >= (int)(sizeof(melody) / sizeof(melody[0]))) {
    // If ALARM_ON is still true, restart the melody from the beginning
    if (ALARM_PLAYING) 
    {
      nyanIndex = 0;
      // Restart the first note
      int freq = melody[nyanIndex];
      if (freq > 0) ledcWriteTone(nyanChannel, freq);
      else ledcWriteTone(nyanChannel, 0);
      nyanNoteDuration = 1000 / noteDurations[nyanIndex];
      nyanNoteStart = currentMillis;
    }
    return;
  }

  // Start next note
  int freq = melody[nyanIndex];
  if (freq > 0) ledcWriteTone(nyanChannel, freq);
  else ledcWriteTone(nyanChannel, 0);

  nyanNoteDuration = 1000 / noteDurations[nyanIndex];
  // small gap between notes (~30%) -> we simulate by extending duration
  unsigned long pause = (unsigned long)(nyanNoteDuration * 1.30);
  nyanNoteStart = currentMillis;
  // To implement the small gap we keep the tone for nyanNoteDuration and
  // the next call will start the following note after nyanNoteDuration.
  // If you want explicit silence, you can write 0 freq for rests.
}



/* ===================== SETUP ===================== */

void setup() 
{
  pinMode(SPEAKER_PIN, OUTPUT);  // Config du speaker en sortie
  pinMode(TRIG_PIN, OUTPUT); // On configure le trig en output
  pinMode(ECHO_PIN, INPUT); // On configure l'echo en input
  pinMode(PIR_PIN, INPUT);
  digitalWrite(SPEAKER_PIN, LOW);


  // Initialiser LEDC pour le speaker (PWM hardware)
  // Canal 0, fréquence 5000 Hz, résolution 8 bits
  ledcSetup(0, 5000, 8);
  ledcAttachPin(SPEAKER_PIN, 0);

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
  pAlarmModeCharacteristic = pAutomationService->createCharacteristic(
    CHAR_ALARM_MODE_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE|
    NIMBLE_PROPERTY::WRITE
  );
  // Utiliser une instance statique au lieu de 'new'
  pAlarmModeCharacteristic->setCallbacks(&alarmModeCallbacks);

  pAlarmPlayingCharacteristic = pAutomationService->createCharacteristic(
    CHAR_ALARM_PLAYING_UUID,
    NIMBLE_PROPERTY::READ |
    NIMBLE_PROPERTY::NOTIFY |
    NIMBLE_PROPERTY::INDICATE
  );

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
  unsigned long currentMillis = millis();
  
  // Lire les capteurs en continu (rapide et non-bloquant)
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

  // Mettre à jour la structure avec les dernières lectures
  sensorData.temperature = bmp.readTemperature();
  sensorData.pressure = bmp.readPressure() / 100.0F; // Convert to hPa
  sensorData.sound = dB;  // Niveau sonore en dB
  sensorData.distance = distance;  // Distance en cm
  sensorData.motionDetected = digitalRead(PIR_PIN);  // Détection de mouvement

  // Détection de front montant : mouvement commence (0 -> 1)
  bool motionRisingEdge = (!prevMotionState && sensorData.motionDetected);
  prevMotionState = sensorData.motionDetected;

  // Démarrer la mélodie de façon non-bloquante
  if(sensorData.motionDetected && ALARM_ON && !ALARM_PLAYING)
  {
    if (!ALARM_PLAYING) startNyanCat();
  }

  // Envoyer le PIR immédiatement si front montant détecté
  if (deviceConnected && pPIRCharacteristic->getSubscribedCount() > 0 && motionRisingEdge)
  {
    pPIRCharacteristic->setValue(sensorData.motionDetected);
    pPIRCharacteristic->notify();
    lastPIRSend = currentMillis;
    Serial.printf("[%lu ms] BLE: MOTION DETECTED! = %d (front montant)\n", currentMillis, sensorData.motionDetected);
  }

  // Affichage continu de toutes les valeurs
  // Serial.printf("Temp: %.2f °C, Pressure: %.2f hPa, Sound: %.2f dB, Distance: %.2f cm, Motion: %d\n", 
  //               sensorData.temperature, sensorData.pressure, sensorData.sound, sensorData.distance, sensorData.motionDetected);

  // Système asynchrone : envoyer chaque capteur selon son propre intervalle
  if (deviceConnected && pTempCharacteristic->getSubscribedCount() > 0) 
  {
    // Température et Pression (intervalle 2s)
    if (currentMillis - lastTempSend >= TEMP_INTERVAL) 
    {
      pTempCharacteristic->setValue(sensorData.temperature);
      pTempCharacteristic->notify();
      pPressionCharacteristic->setValue(sensorData.pressure);
      pPressionCharacteristic->notify();
      lastTempSend = currentMillis;
      Serial.printf("[%lu ms] BLE: Temp = %.2f°C, Pressure = %.2f hPa\n", currentMillis, sensorData.temperature, sensorData.pressure);
    }
    
    // Son (intervalle 0.5s)
    if (currentMillis - lastSoundSend >= SOUND_INTERVAL) 
    {
      pSoundCharacteristic->setValue(sensorData.sound);
      pSoundCharacteristic->notify();
      lastSoundSend = currentMillis;
      Serial.printf("[%lu ms] BLE: Sound level = %.2f dB\n", currentMillis, sensorData.sound);
    }
    
    // Distance (intervalle 0.5s)
    if (currentMillis - lastDistanceSend >= DISTANCE_INTERVAL) 
    {
      pDistanceCharacteristic->setValue(sensorData.distance);
      pDistanceCharacteristic->notify();
      lastDistanceSend = currentMillis;
      Serial.printf("[%lu ms] BLE: Distance = %.2f cm\n", currentMillis, sensorData.distance);
    }
    
    // PIR (intervalle 0.5s)
    if (currentMillis - lastPIRSend >= PIR_INTERVAL) 
    {
      pPIRCharacteristic->setValue(sensorData.motionDetected);
      pPIRCharacteristic->notify();
      lastPIRSend = currentMillis;
      Serial.printf("[%lu ms] BLE: Motion = %d\n", currentMillis, sensorData.motionDetected);
    }
  }

  // Pas de delay global - la boucle s'exécute aussi rapidement que possible
  // Les intervalles sont gérés par le système de minuteurs ci-dessus
  // Mettre à jour le player non-bloquant
  updateNyanCat(currentMillis);

  delayMicroseconds(100); // Petit délai pour éviter de surcharger le processeur
}