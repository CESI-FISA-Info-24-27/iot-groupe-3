from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), index=True)
    device_id = Column(String, index=True)
    type = Column(String)
    value = Column(Float)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), index=True)
    device_id = Column(String)
    alert_type = Column(String)
    value_triggered = Column(Float)
    snapshot_path = Column(String)

class Led(Base):
    __tablename__ = "leds"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    status = Column(String)  




