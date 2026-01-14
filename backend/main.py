from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from models import Measurement, Alert, Led, Temperature
from database import init_db
from schemas import (
    MeasurementCreate, MeasurementOut,
    AlertCreate, AlertOut,
    LedCreate, LedOut,
    TemperatureCreate, TemperatureOut
)

init_db()

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


@app.post("/measurements/", response_model=MeasurementOut)
def create_measurement(
    payload: MeasurementCreate,
    db: Session = Depends(get_db)
):
    m = Measurement(
        device_id=payload.device_id,
        type=payload.measurement_type,
        value=payload.value
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@app.get("/measurements/", response_model=List[MeasurementOut])
def get_measurements(db: Session = Depends(get_db)):
    return db.query(Measurement).order_by(Measurement.timestamp.desc()).all()


@app.post("/alerts/", response_model=AlertOut)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db)
):
    alert = Alert(**payload.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@app.get("/alerts/", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).all()


@app.post("/leds/", response_model=LedOut)
def set_led(
    payload: LedCreate,
    db: Session = Depends(get_db)
):
    led = db.query(Led).filter(Led.device_id == payload.device_id).first()
    if led:
        led.status = payload.status
    else:
        led = Led(**payload.dict())
        db.add(led)
    db.commit()
    db.refresh(led)
    return led


@app.get("/leds/", response_model=List[LedOut])
def get_leds(db: Session = Depends(get_db)):
    return db.query(Led).all()


@app.post("/temperature/", response_model=TemperatureOut)
def create_temperature(
    payload: TemperatureCreate,
    db: Session = Depends(get_db)
):
    t = Temperature(**payload.dict())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t
