from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Measurement, Alert, Led, Temperature

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/measurements/")
def create_measurement(device_id: str, type: str, value: float, db: Session = Depends(get_db)):
    m = Measurement(device_id=device_id, type=type, value=value)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@app.get("/measurements/")
def get_measurements(db: Session = Depends(get_db)):
    return db.query(Measurement).order_by(Measurement.timestamp.desc()).all()

@app.post("/alerts/")
def create_alert(device_id: str, alert_type: str, value_triggered: float, snapshot_path: str, db: Session = Depends(get_db)):
    alert = Alert(
        device_id=device_id,
        alert_type=alert_type,
        value_triggered=value_triggered,
        snapshot_path=snapshot_path
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@app.get("/alerts/")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).all()

@app.post("/leds/")
def set_led(device_id: str, status: str, db: Session = Depends(get_db)):
    led = db.query(Led).filter(Led.device_id == device_id).first()
    if led:
        led.status = status
    else:
        led = Led(device_id=device_id, status=status)
        db.add(led)
    db.commit()
    db.refresh(led)
    return led

@app.get("/leds/")
def get_leds(db: Session = Depends(get_db)):
    return db.query(Led).all()

@app.post("/temperature/")
def create_temperature(device_id: str, value: float, humidity: float, db: Session = Depends(get_db)):
    t = Temperature(device_id=device_id, value=value, humidity=humidity)
