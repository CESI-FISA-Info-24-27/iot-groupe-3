from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class LedStatus(str, Enum):
    on = "on"
    off = "off"


class MeasurementCreate(BaseModel):
    device_id: str
    measurement_type: str
    value: float


class MeasurementOut(BaseModel):
    id: int
    device_id: str
    measurement_type: str
    value: float
    timestamp: datetime

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    device_id: str
    alert_type: str
    value_triggered: float
    snapshot_path: str = Field(..., min_length=1, max_length=255)


class AlertOut(BaseModel):
    id: int
    device_id: str
    alert_type: str
    value_triggered: float
    snapshot_path: str
    timestamp: datetime

class Config:
    from_attributes = True


class LedCreate(BaseModel):
    device_id: str
    status: LedStatus


class LedOut(BaseModel):
    id: int
    device_id: str
    status: LedStatus

class Config:
    from_attributes = True


class TemperatureCreate(BaseModel):
    device_id: str
    value: float
    humidity: float


class TemperatureOut(BaseModel):
    id: int
    device_id: str
    value: float
    humidity: float
    timestamp: datetime

class Config:
    from_attributes = True
