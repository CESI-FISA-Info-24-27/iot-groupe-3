from datetime import datetime
from .base import ORMBase

class MeasurementBase(ORMBase):
    device_id: str
    measurement_type: str
    value: float

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementRead(MeasurementBase):
    id: int
    timestamp: datetime
