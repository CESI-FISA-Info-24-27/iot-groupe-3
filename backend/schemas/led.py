from enum import Enum
from .base import ORMBase

class LedStatus(str, Enum):
    on = "on"
    off = "off"

class LedBase(ORMBase):
    device_id: str
    status: LedStatus

class LedCreate(LedBase):
    pass

class LedRead(LedBase):
    id: int
