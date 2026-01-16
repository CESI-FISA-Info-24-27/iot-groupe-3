from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from .base import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), index=True)
    device_id = Column(String, index=True)
    measurement_type  = Column(String)
    value = Column(Float)
    