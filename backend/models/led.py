from sqlalchemy import Column, Integer, String
from .base import Base

class Led(Base):
    __tablename__ = "leds"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    status = Column(String)
