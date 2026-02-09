#!/usr/bin/env python3
"""
Camera Analytics Service - Pour SERVEUR
Détection de personnes, floutage de visages, analyse de luminosité
Se connecte au Raspberry Pi qui fait le proxy de l'ESP32-CAM
"""
import requests
from flask import Flask, Response, jsonify, request
import cv2
import numpy as np
import time
import logging
import threading
from datetime import datetime
from collections import deque

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Configuration - À ADAPTER
RASPBERRY_PROXY_URL = "http://localhost:9888/stream"  # URL du proxy Raspberry via tunnel SSH
BACKEND_URL = "http://localhost:8081"  # URL du backend Express Docker

# Variables globales
latest_frame = None
latest_frame_cv = None  # Frame OpenCV pour analyse
last_update = 0
capture_active = True
frame_counter = 0  # Compteur pour analyser 1 frame sur N
last_frame_time = 0  # Pour calculer FPS/latence

# Modèles de détection
person_detector = None
face_cascade = None

# Métriques d'occupation
occupancy_history = deque(maxlen=60)  # 60 secondes d'historique
current_metrics = {
    "person_count": 0,
    "light_on": False,
    "is_occupied": False,
    "confidence": 0.0,
    "last_detection": None,
    "occupancy_rate": 0.0  # Pourcentage sur la dernière minute
}

def load_detection_models():
    """Charge les modèles de détection OpenCV"""
    global person_detector, face_cascade
    
    try:
        # Détecteur de personnes HOG (léger pour Raspberry)
        person_detector = cv2.HOGDescriptor()
        person_detector.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        logging.info("✓ Détecteur de personnes chargé (HOG)")
        
        # Détecteur de visages Haar Cascade
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        logging.info("✓ Détecteur de visages chargé (Haar)")
        
    except Exception as e:
        logging.error(f"Erreur chargement modèles: {e}")

def detect_persons(frame):
    """Détecte les personnes dans une image"""
    if person_detector is None:
        return [], 0
    
    try:
        # Redimensionner pour optimiser performance - Équilibre vitesse/précision
        height, width = frame.shape[:2]
        scale = 480 / width if width > 480 else 1  # Augmenté de 320 à 480 pour meilleure détection
        if scale < 1:
            frame_resized = cv2.resize(frame, None, fx=scale, fy=scale)
        else:
            frame_resized = frame
        
        # Détection avec paramètres équilibrés
        boxes, weights = person_detector.detectMultiScale(
            frame_resized,
            winStride=(8, 8),    # Réduit de 16 à 8 pour meilleure détection
            padding=(4, 4),      # Réduit de 8 à 4
            scale=1.05,          # Réduit de 1.1 à 1.05 pour plus de précision
            useMeanshiftGrouping=False
        )
        
        # Convertir en array si vide
        if len(boxes) == 0:
            return np.array([]), 0
        
        # Rescale boxes
        if scale < 1:
            boxes = (boxes / scale).astype(int)
        
        return boxes, len(boxes)
        
    except Exception as e:
        logging.error(f"Erreur détection personnes: {e}")
        return np.array([]), 0

def detect_faces(frame):
    """Détecte les visages dans une image"""
    if face_cascade is None:
        return []
    
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        return faces
        
    except Exception as e:
        logging.error(f"Erreur détection visages: {e}")
        return []

def blur_faces(frame, faces):
    """Floute les visages détectés avec un flou plus fort"""
    for (x, y, w, h) in faces:
        # Agrandir légèrement la zone pour mieux couvrir
        padding = int(h * 0.1)
        y1 = max(0, y - padding)
        y2 = min(frame.shape[0], y + h + padding)
        x1 = max(0, x - padding)
        x2 = min(frame.shape[1], x + w + padding)
        
        # Extraire la région du visage
        face_region = frame[y1:y2, x1:x2]
        
        # Appliquer un flou gaussien très fort
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 50)
        
        # Remplacer dans l'image originale
        frame[y1:y2, x1:x2] = blurred_face
    
    return frame

def detect_light_status(frame):
    """Détecte si la lumière est allumée en analysant la luminosité"""
    try:
        # Convertir en niveaux de gris
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calculer la luminosité moyenne
        mean_brightness = np.mean(gray)
        
        # Seuil augmenté : > 120 = lumière artificielle allumée (évite lumière naturelle)
        light_on = mean_brightness > 120
        
        return light_on, float(mean_brightness)
        
    except Exception as e:
        logging.error(f"Erreur détection lumière: {e}")
        return False, 0.0

def analyze_frame(frame):
    """Analyse complète d'une frame"""
    global current_metrics
    
    try:
        # Détecter visages - BASE DE COMPTAGE DES PERSONNES
        faces = detect_faces(frame)
        person_count = len(faces)  # Nombre de personnes = nombre de visages
        
        # Détecter luminosité
        light_on, brightness = detect_light_status(frame)
        
        # Calculer si occupé
        is_occupied = person_count > 0
        confidence = min(person_count * 0.3, 1.0) if person_count > 0 else 0.0
        
        # Mettre à jour métriques - Convertir explicitement en types Python natifs
        current_metrics.update({
            "person_count": int(person_count),  # Nombre de visages = personnes
            "face_count": int(len(faces)),
            "light_on": bool(light_on),
            "brightness": float(round(brightness, 2)),
            "is_occupied": bool(is_occupied),
            "confidence": float(round(confidence, 2)),
            "last_detection": datetime.now().isoformat(),
            "faces": faces.tolist() if len(faces) > 0 else []  # Coordonnées visages pour affichage
        })
        
        # Historique d'occupation
        occupancy_history.append(1 if is_occupied else 0)
        current_metrics["occupancy_rate"] = float(round(
            sum(occupancy_history) / len(occupancy_history) * 100, 2
        ))
        
        return faces
        
    except Exception as e:
        logging.error(f"Erreur analyse frame: {e}")
        return [], []

def continuous_capture():
    """Capture et analyse en continu les frames depuis le proxy Raspberry Pi"""
    global latest_frame, latest_frame_cv, last_update, frame_counter
    
    while capture_active:
        try:
            logging.info(f"Connexion au proxy Raspberry: {RASPBERRY_PROXY_URL}")
            response = requests.get(RASPBERRY_PROXY_URL, stream=True, timeout=10)
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
                    
                    # Décoder immédiatement pour éviter buffering
                    nparr = np.frombuffer(jpg, np.uint8)
                    frame_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame_cv is not None:
                        # Mettre à jour avec timestamp précis
                        latest_frame = jpg
                        latest_frame_cv = frame_cv
                        last_update = time.time()
                        
                        # Analyser seulement 1 frame sur 3 pour réduire CPU
                        frame_counter += 1
                        if frame_counter % 3 == 0:
                            analyze_frame(frame_cv)
        
        except Exception as e:
            logging.error(f"Erreur capture: {e}")
            time.sleep(5)

def send_metrics_to_backend():
    """Envoie les métriques au backend Express"""
    while capture_active:
        try:
            if current_metrics["last_detection"]:
                # Envoyer au backend
                payload = {
                    "timestamp": datetime.now().isoformat(),
                    "metrics": current_metrics
                }
                
                response = requests.post(
                    f"{BACKEND_URL}/camera/occupancy",
                    json=payload,
                    timeout=5
                )
                
                if response.status_code == 200:
                    logging.debug("Métriques envoyées au backend")
            
            time.sleep(10)  # Envoyer toutes les 10 secondes
            
        except Exception as e:
            logging.error(f"Erreur envoi métriques: {e}")
            time.sleep(10)

# ============================================
# Routes Flask
# ============================================

@app.route('/stream')
def video_feed():
    """Stream vidéo brut (sans annotation) - ULTRA RAPIDE, pas d'analyse"""
    def generate():
        while True:
            if latest_frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            time.sleep(0.03)  # ~30 FPS
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stream/fast')
def video_feed_fast():
    """Stream vidéo ultra-rapide direct du proxy (bypass total de l'analyse)"""
    def generate():
        while True:
            if latest_frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            time.sleep(0.02)  # ~50 FPS max
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stream/complete')
def video_feed_complete():
    """Stream complet : détections + floutage - Optimisé pour <200ms latence"""
    def generate():
        frame_times = deque(maxlen=10)  # Réduit pour calcul plus réactif
        last_yield_time = 0
        
        while True:
            if latest_frame_cv is not None:
                # Timestamp de capture de cette frame
                frame_timestamp = last_update
                processing_start = time.time()
                
                # Copier la frame
                frame = latest_frame_cv.copy()
                
                # Calculer FPS
                current_time = time.time()
                if last_yield_time > 0:
                    frame_times.append(current_time - last_yield_time)
                last_yield_time = current_time
                fps = len(frame_times) / sum(frame_times) if len(frame_times) > 0 else 0
                
                # Détecter et flouter les visages (cache depuis analyze_frame)
                faces = current_metrics.get("faces", [])
                if len(faces) > 0:
                    frame = blur_faces(frame, np.array(faces))
                
                # Dessiner boxes autour des visages pour montrer détection
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 255), 2)  # Jaune pour visages
                    cv2.putText(frame, f"Person", (x, y-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                
                # === PANNEAU D'INFORMATIONS ===
                overlay = frame.copy()
                cv2.rectangle(overlay, (0, 0), (frame.shape[1], 110), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
                
                # État de la lumière
                light_status = "Light: ON" if current_metrics.get("light_on", False) else "Light: OFF"
                light_color = (0, 255, 0) if current_metrics.get("light_on", False) else (0, 0, 255)
                brightness = current_metrics.get("brightness", 0)
                cv2.putText(frame, f"{light_status} ({brightness:.0f})", (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, light_color, 2)
                
                # Nombre de personnes (basé sur visages)
                person_count = current_metrics.get("person_count", 0)
                person_color = (0, 255, 0) if person_count > 0 else (150, 150, 150)
                cv2.putText(frame, f"Persons: {person_count}", (10, 60),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, person_color, 2)
                
                # Calculer latence précise (temps depuis capture)
                latency_ms = int((processing_start - frame_timestamp) * 1000)
                latency_color = (0, 255, 0) if latency_ms < 200 else (0, 165, 255) if latency_ms < 500 else (0, 0, 255)
                cv2.putText(frame, f"Latency: {latency_ms}ms | FPS: {fps:.1f}", (10, 90),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, latency_color, 2)
                
                # Encoder en JPEG avec qualité optimisée
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])  # Réduit de 80 à 75
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                # Fallback sur flux brut
                if latest_frame:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            time.sleep(0.02)  # 50 FPS max pour réduire latence
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stream/annotated')
def video_feed_annotated():
    """Stream vidéo avec annotations (boxes de détection)"""
    def generate():
        while True:
            if latest_frame_cv is not None:
                frame = latest_frame_cv.copy()
                
                # Dessiner les boxes de personnes
                for (x, y, w, h) in current_metrics.get("person_boxes", []):
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    cv2.putText(frame, "Person", (x, y-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # Encoder en JPEG
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.05)
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stream/blurred')
def video_feed_blurred():
    """Stream vidéo avec visages floutés"""
    def generate():
        while True:
            if latest_frame_cv is not None:
                frame = latest_frame_cv.copy()
                
                # Détecter et flouter visages
                faces = detect_faces(frame)
                frame = blur_faces(frame, faces)
                
                # Encoder en JPEG
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.05)
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/snapshot')
def snapshot():
    """Snapshot sans annotation"""
    if latest_frame and time.time() - last_update < 5:
        return Response(latest_frame, mimetype='image/jpeg')
    return jsonify({"error": "No frame available"}), 503

@app.route('/snapshot/blurred')
def snapshot_blurred():
    """Snapshot avec visages floutés"""
    if latest_frame_cv is not None and time.time() - last_update < 5:
        frame = latest_frame_cv.copy()
        faces = detect_faces(frame)
        frame = blur_faces(frame, faces)
        
        _, buffer = cv2.imencode('.jpg', frame)
        return Response(buffer.tobytes(), mimetype='image/jpeg')
    
    return jsonify({"error": "No frame available"}), 503

@app.route('/metrics')
def metrics():
    """Retourne les métriques d'occupation actuelles"""
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "metrics": current_metrics,
        "status": "ok" if time.time() - last_update < 10 else "stale"
    })

@app.route('/occupancy')
def occupancy():
    """Retourne uniquement les données d'occupation"""
    return jsonify({
        "is_occupied": current_metrics["is_occupied"],
        "person_count": current_metrics["person_count"],
        "occupancy_rate": current_metrics["occupancy_rate"],
        "light_on": current_metrics["light_on"],
        "confidence": current_metrics["confidence"],
        "timestamp": current_metrics["last_detection"]
    })

@app.route('/health')
def health():
    """Health check"""
    is_alive = latest_frame is not None and time.time() - last_update < 10
    return jsonify({
        "status": "ok" if is_alive else "error",
        "last_update": last_update,
        "raspberry_proxy_url": RASPBERRY_PROXY_URL,
        "models_loaded": person_detector is not None and face_cascade is not None,
        "metrics": current_metrics
    })

@app.route('/debug')
def debug():
    """Debug info - détection"""
    return jsonify({
        "person_detector_loaded": person_detector is not None,
        "face_detector_loaded": face_cascade is not None,
        "latest_frame_available": latest_frame is not None,
        "latest_frame_cv_available": latest_frame_cv is not None,
        "last_update_ago_seconds": time.time() - last_update if last_update > 0 else -1,
        "current_metrics": current_metrics,
        "frame_counter": frame_counter,
        "analysis_rate": "1 frame / 3"
    })

if __name__ == '__main__':
    logging.info("=" * 60)
    logging.info("Camera Analytics Service - SERVEUR")
    logging.info("=" * 60)
    
    # Charger les modèles de détection
    logging.info("Chargement des modèles de détection...")
    load_detection_models()
    
    # Lancer le thread de capture
    logging.info("Démarrage thread de capture depuis Raspberry Pi...")
    capture_thread = threading.Thread(target=continuous_capture, daemon=True)
    capture_thread.start()
    
    # Lancer le thread d'envoi de métriques
    logging.info("Démarrage thread d'envoi de métriques...")
    metrics_thread = threading.Thread(target=send_metrics_to_backend, daemon=True)
    metrics_thread.start()
    
    logging.info("Serveur prêt sur http://0.0.0.0:8889")
    logging.info("=" * 60)
    logging.info("Routes disponibles:")
    logging.info("  /stream/complete - Flux complet (détections + floutage + infos)")
    logging.info("  /stream/fast     - Flux ultra-rapide (~50 FPS, pas d'annotations)")
    logging.info("  /stream          - Flux vidéo brut (~30 FPS)")
    logging.info("  /stream/annotated - Flux avec détections uniquement")
    logging.info("  /stream/blurred  - Flux avec visages floutés uniquement")
    logging.info("  /snapshot        - Snapshot brut")
    logging.info("  /snapshot/blurred - Snapshot flouté")
    logging.info("  /metrics         - Toutes les métriques")
    logging.info("  /occupancy       - Données d'occupation")
    logging.info("  /health          - Health check")
    logging.info("=" * 60)
    
    app.run(host='0.0.0.0', port=8889, threaded=True)
