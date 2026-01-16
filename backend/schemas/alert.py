from datetime import datetime
from pydantic import Field
from .base import ORMBase

class AlertBase(ORMBase):
    device_id: str
    alert_type: str
    value_triggered: float
    snapshot_path: str = Field(..., min_length=1, max_length=255)

class AlertCreate(AlertBase):
    pass

class AlertRead(AlertBase):
    id: int
    timestamp: datetime
