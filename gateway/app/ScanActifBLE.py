import asyncio
import struct
import json
import paho.mqtt.client as mqtt
from bleak import BleakScanner, BleakClient
from typing import Optional

# Informations serveur MQTT
MQTT_BROKER = "loicserre.freeboxos.fr"
MQTT_PORT = 1883

# Topics de commandes (frontend -> gateway)
CMD_ALARM_TOPIC = "commands/alarme"
CMD_ALARM_STOP_TOPIC = "commands/alarme_stop"

CHAR_MAP = {
    "f1047d07-53c8-4877-9c5f-29f7161c516d": ("Température", "°C", "capteurs/temperature", "float32"),
    "79d4a577-2f8e-4b44-922a-b807b600eb80": ("Pression", "hPa", "capteurs/pression", "float32"),
    "cf5e24c5-9d6e-48bb-b256-bf0fdbfe0e05": ("Son", "dB", "capteurs/son", "float32"),
    "67eec361-5161-489a-8492-ec27b8c7731e": ("Distance", "cm", "capteurs/distance", "float32"),
    "7a1d01a8-0234-4087-bc1d-077368a51172": ("Présence", "Détecté/Absent", "capteurs/presence", "boolean"),
    "65fd3587-3516-4af9-8f30-160c005f1170": ("Alarme", "Activée/Désactivée", "surveillance/alarme", "boolean"),
    "f93c7fe3-5f42-4556-9110-6afc288afdc1": ("Alarme Sonne", "Activée/Désactivée", "surveillance/alarme_sonne", "boolean"),
}

# Caractéristiques d'écriture pour les commandes (UUIDs à adapter)
ACTUATOR_MAP = {  
    "alarme": "65fd3587-3516-4af9-8f30-160c005f1170",
}

# Décodeurs pour différents types de données
DECODERS = {
    "float32": lambda d: struct.unpack("<f", d)[0],
    "uint8": lambda d: struct.unpack("<B", d[:1])[0],
    "int16": lambda d: struct.unpack("<h", d[:2])[0],
    "uint16": lambda d: struct.unpack("<H", d[:2])[0],
    "boolean": lambda d: bool(d[0]),
}

# Globals
ble_client: Optional[BleakClient] = None
asyncio_loop: Optional[asyncio.AbstractEventLoop] = None


def format_value(value):
    """Formate l'affichage selon le type de valeur"""
    formatters = {
        bool: lambda v: 'Détecté' if v else 'Absent',
        float: lambda v: f"{v:.2f}",
        int: lambda v: str(v),
    }
    formatter = formatters.get(type(value), str)
    return formatter(value)


def make_notification_handler(mqtt_client):
    def handler(sender, data):
        notification_handler(sender, data, mqtt_client)
    return handler


def decode_sensor_data(data, data_type):
    """Décode les données selon le type spécifié"""
    try:
        decoder = DECODERS.get(data_type, DECODERS["float32"])  # Défaut : float32
        return decoder(data)
    except Exception as e:
        print(f"Error decoding data type {data_type}: {e}")
        return None


def notification_handler(sender, data, mqtt_client=None):
    try:
        sender_uuid = sender if isinstance(sender, str) else getattr(sender, 'uuid', str(sender))

        if sender_uuid in CHAR_MAP:
            label, unit, topic, data_type = CHAR_MAP[sender_uuid]
            value = decode_sensor_data(data, data_type)

            if value is not None:
                formatted_value = format_value(value)
                print(f"{label} : {formatted_value} ({unit})")

                if mqtt_client:
                    payload = json.dumps({"value": value, "unit": unit})
                    mqtt_client.publish(topic, payload)
        else:
            print(f"Unknown UUID {sender_uuid} → Raw={data.hex()}")

    except Exception as e:
        print(f"Error decoding {sender}: {e} | Raw={getattr(data, 'hex', lambda: str(data))()}" )


async def write_to_ble(command_type, value):
    """Envoie une commande à l'ESP32 via BLE (planifiée depuis le callback MQTT)."""
    global ble_client

    if not ble_client or not getattr(ble_client, 'is_connected', False):
        print(f"⚠️  Client BLE non connecté — commande '{command_type}' ignorée")
        return

    char_uuid = ACTUATOR_MAP.get(command_type)
    if not char_uuid or char_uuid.startswith('x'):
        print(f"❌ UUID non configuré pour '{command_type}'")
        return

    # Interpréter la valeur (supporte JSON like {"value":...} ou simple string)
    v = value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict) and 'value' in parsed:
                v = parsed['value']
        except Exception:
            v = value.strip()

    if isinstance(v, (int, bool)):
        data = bytes([1 if v else 0])
    elif isinstance(v, str):
        lv = v.lower()
        if lv in ("1", "true", "on", "yes"):
            data = bytes([1])
        elif lv in ("0", "false", "off", "no"):
            data = bytes([0])
        else:
            data = v.encode()
    else:
        data = str(v).encode()

    try:
        await ble_client.write_gatt_char(char_uuid, data)
        print(f"✅ Commande '{command_type}' envoyée -> {data.hex()}")
    except Exception as e:
        print(f"❌ Erreur écriture BLE ({command_type}): {e}")


def on_mqtt_message(client, userdata, msg):
    """Callback appelé par paho-mqtt dans son thread réseau.
    Nous planifions l'envoi BLE sur la boucle asyncio principale."""
    global asyncio_loop

    topic = msg.topic
    payload = msg.payload.decode(errors='ignore')
    print(f"📨 MQTT reçu: {topic} -> {payload}")

    mapping = {
        CMD_ALARM_TOPIC: 'alarme',
        CMD_ALARM_STOP_TOPIC: 'alarme_stop',
    }

    command_type = mapping.get(topic)
    if not command_type:
        print(f"Topic MQTT non géré: {topic}")
        return

    if not asyncio_loop:
        print("⚠️  Boucle asyncio non initialisée, impossible d'envoyer vers BLE")
        return

    # Planifier la coroutine d'envoi sur la boucle asyncio
    try:
        asyncio.run_coroutine_threadsafe(write_to_ble(command_type, payload), asyncio_loop)
    except Exception as e:
        print(f"Erreur planification write_to_ble: {e}")


async def scan():
    return await BleakScanner.find_device_by_name("EcoGuard_GrpX", timeout=10.0)


async def connect_and_listen(device, mqtt_client, max_retries=5, initial_delay=5):
    """Se connecte à l'appareil BLE et écoute les notifications avec reconnexion automatique."""
    global ble_client

    retry_count = 0
    delay = initial_delay

    while retry_count < max_retries:
        client = None
        try:
            client = BleakClient(device.address)
            await client.connect()
            ble_client = client
            print(f"Connected to {device.name} ({device.address})")

            # Récupérer les services après connexion
            services = client.services

            handler_with_mqtt = make_notification_handler(mqtt_client)

            notifiable_chars = []
            for service in services:
                print(f"\nService {service.uuid}")
                for char in service.characteristics:
                    print(f"  Characteristic {char.uuid} | Properties: {char.properties}")
                    if "notify" in char.properties:
                        notifiable_chars.append(char.uuid)

            if not notifiable_chars:
                print("No notifiable characteristics found.")
            else:
                for char_uuid in notifiable_chars:
                    await client.start_notify(char_uuid, handler_with_mqtt)
                    print(f"Subscribed to {char_uuid}")

                print("\nListening for notifications... (Ctrl+C to stop)")
                try:
                    while True:
                        await asyncio.sleep(1)
                except KeyboardInterrupt:
                    raise
                finally:
                    for char_uuid in notifiable_chars:
                        try:
                            await client.stop_notify(char_uuid)
                        except Exception:
                            pass
                    print("Disconnected BLE session.")

        except KeyboardInterrupt:
            print("Program stopped by user.")
            break
        except Exception as e:
            retry_count += 1
            print(f"\nDisconnection detected: {e}")
            print(f"Reconnection attempt {retry_count}/{max_retries}...")
            if retry_count < max_retries:
                print(f"Waiting {delay} seconds before reconnecting...")
                await asyncio.sleep(delay)
                delay = min(delay * 1.5, 60)
            else:
                print(f"Failed to reconnect after {max_retries} attempts.")
                break
        finally:
            if client:
                try:
                    await client.disconnect()
                except Exception:
                    pass
            ble_client = None


async def print_dots(task):
    print("\nScanning for EcoGuard_GrpX", end="", flush=True)
    while not task.done():
        print(".", end="", flush=True)
        await asyncio.sleep(0.5)
    print("\n")


async def main():
    global asyncio_loop
    asyncio_loop = asyncio.get_event_loop()

    scan_task = asyncio.create_task(scan())
    dots_task = asyncio.create_task(print_dots(scan_task))

    device, _ = await asyncio.gather(scan_task, dots_task)

    if device is None:
        print("Exiting program. EcoGuard_GrpX not found.")
        return

    print(f"Found device: {device.name} ({device.address})")

    # Initialiser le client MQTT
    mqtt_client = mqtt.Client()
    mqtt_client.on_message = on_mqtt_message
    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        print(f"Erreur connexion MQTT: {e}")

    # S'abonner aux topics de commande
    mqtt_client.subscribe(CMD_ALARM_TOPIC)
    mqtt_client.subscribe(CMD_ALARM_STOP_TOPIC)

    mqtt_client.loop_start()

    try:
        await connect_and_listen(device, mqtt_client)
    finally:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
