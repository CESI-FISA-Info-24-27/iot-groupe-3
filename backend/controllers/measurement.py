from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Measurement
from schemas import MeasurementCreate, MeasurementRead

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post("/", response_model=MeasurementRead)
def create_measurement(payload: MeasurementCreate, db: Session = Depends(get_db)):
    m = Measurement(**payload.dict())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/", response_model=list[MeasurementRead])
def get_measurements(db: Session = Depends(get_db)):
    return db.query(Measurement).order_by(Measurement.timestamp.desc()).all()
