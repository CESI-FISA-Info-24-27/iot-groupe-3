from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Led
from schemas import LedCreate, LedRead

router = APIRouter(prefix="/leds", tags=["LEDs"])


@router.post("/", response_model=LedRead)
def set_led(payload: LedCreate, db: Session = Depends(get_db)):
    led = db.query(Led).filter(Led.device_id == payload.device_id).first()
    if led:
        led.status = payload.status
    else:
        led = Led(**payload.dict())
        db.add(led)

    db.commit()
    db.refresh(led)
    return led


@router.get("/", response_model=list[LedRead])
def get_leds(db: Session = Depends(get_db)):
    return db.query(Led).all()
