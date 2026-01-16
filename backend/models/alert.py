from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from .base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), index=True)
    device_id = Column(String)
    alert_type = Column(String)
    value_triggered = Column(Float)
    snapshot_path = Column(String)
