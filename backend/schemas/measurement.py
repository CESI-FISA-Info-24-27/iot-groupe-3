from pydantic import BaseModel
from datetime import datetime

class MeasurementBase(BaseModel):
    device_id: str
    type: str
    value: float

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementRead(MeasurementBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
