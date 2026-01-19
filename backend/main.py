from fastapi import FastAPI
from database import init_db
from controllers import (
    measurement_router,
    alert_router,
    led_router,
    temperature_router
)

app = FastAPI(title="EcoGuard API")

init_db()

@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(measurement_router)
app.include_router(alert_router)
app.include_router(led_router)
app.include_router(temperature_router)
