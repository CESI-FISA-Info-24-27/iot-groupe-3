from datetime import datetime
from .base import ORMBase

class TemperatureBase(ORMBase):
    device_id: str
    value: float
    humidity: float

class TemperatureCreate(TemperatureBase):
    pass

class TemperatureRead(TemperatureBase):
    id: int
    timestamp: datetime
