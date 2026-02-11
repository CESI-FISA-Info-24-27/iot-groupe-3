#!/usr/bin/env python3
"""
Camera Proxy Simple - RASPBERRY PI
Fait juste le relais du flux ESP32-CAM vers le serveur
Pas de traitement AI (fait sur le serveur)
"""
import requests
from flask import Flask, Response, jsonify
import time
import logging
import threading

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Configuration ESP32-CAM
ESP32_CAM_URL = "http://10.94.86.91:81/stream"  # IP de votre ESP32-CAM

# Variables globales
latest_frame = None
last_update = 0
capture_active = True

def continuous_capture():
    """Capture en continu les frames depuis l'ESP32-CAM"""
    global latest_frame, last_update

    while capture_active:
        try:
            logging.info(f"Connexion à ESP32-CAM: {ESP32_CAM_URL}")
            response = requests.get(ESP32_CAM_URL, stream=True, timeout=10)
            bytes_data = bytes()

            for chunk in response.iter_content(chunk_size=1024):
                if not capture_active:
                    break

                bytes_data += chunk
                a = bytes_data.find(b'\xff\xd8')
                b = bytes_data.find(b'\xff\xd9')

                if a != -1 and b != -1:
                    jpg = bytes_data[a:b+2]
                    bytes_data = bytes_data[b+2:]
                    latest_frame = jpg
                    last_update = time.time()

        except Exception as e:
            logging.error(f"Erreur capture: {e}")
            time.sleep(5)  # Attendre avant de réessayer

@app.route('/stream')
def video_feed():
    """Stream vidéo brut - Pas de traitement"""
    def generate():
        while True:
            if latest_frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            time.sleep(0.05)  # 20 FPS max

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/snapshot')
def snapshot():
    """Snapshot brut"""
    if latest_frame and time.time() - last_update < 5:
        return Response(latest_frame, mimetype='image/jpeg')
    return jsonify({"error": "No frame available"}), 503

@app.route('/health')
def health():
    """Health check"""
    is_alive = latest_frame is not None and time.time() - last_update < 10
    return jsonify({
        "status": "ok" if is_alive else "error",
        "last_update": last_update,
        "esp32_url": ESP32_CAM_URL,
        "role": "simple_proxy",
        "note": "AI processing done on server"
    })

if __name__ == '__main__':
    logging.info("=" * 60)
    logging.info("Camera Proxy Simple - RASPBERRY PI")
    logging.info("Relais ESP32-CAM vers serveur (pas de traitement AI)")
    logging.info("=" * 60)
    
    # Lancer le thread de capture en arrière-plan
    logging.info("Démarrage thread de capture depuis ESP32-CAM...")
    capture_thread = threading.Thread(target=continuous_capture, daemon=True)
    capture_thread.start()
    
    logging.info("Proxy prêt sur http://0.0.0.0:8888")
    logging.info("=" * 60)
    logging.info("Routes disponibles:")
    logging.info("  /stream   - Flux vidéo brut (relais ESP32)")
    logging.info("  /snapshot - Snapshot")
    logging.info("  /health   - Health check")
    logging.info("=" * 60)
    logging.info("Le serveur fera l'analyse AI en se connectant à ce proxy")
    logging.info("=" * 60)
    
    app.run(host='0.0.0.0', port=8888, threaded=True)
