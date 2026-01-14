from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    device_id: str
    alert_type: str
    value_triggered: float
    snapshot_path: str

class AlertCreate(AlertBase):
    pass

class AlertRead(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
