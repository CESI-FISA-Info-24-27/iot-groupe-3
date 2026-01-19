from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Alert
from schemas import AlertCreate, AlertRead

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("/", response_model=AlertRead)
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(**payload.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/", response_model=list[AlertRead])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).all()
