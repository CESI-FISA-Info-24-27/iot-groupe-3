from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Temperature
from schemas import TemperatureCreate, TemperatureRead

router = APIRouter(prefix="/temperature", tags=["Temperature"])


@router.post("/", response_model=TemperatureRead)
def create_temperature(payload: TemperatureCreate, db: Session = Depends(get_db)):
    t = Temperature(**payload.dict())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t
