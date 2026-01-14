from pydantic import BaseModel
from datetime import datetime

class TemperatureBase(BaseModel):
    device_id: str
    value: float
    humidity: float

class TemperatureCreate(TemperatureBase):
    pass

class TemperatureRead(TemperatureBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
