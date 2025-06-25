from fastapi import APIRouter, HTTPException
from backend.service.model_service import train_product_model, predict_next_month
from backend.service.forecast_service import get_forecasts

router = APIRouter()

@router.post("/models/{product_id}/train")
async def train_model_route(product_id: int):
    """Belirli bir ürün için model eğitir ve kaydeder."""
    return await train_product_model(product_id)

@router.get("/models/{product_id}/predict")
async def predict_model_route(product_id: int):
    """Belirli bir ürün için eğitilen model ile bir sonraki ay satış tahmini yapar."""
    return await predict_next_month(product_id)

@router.get("/forecasts")
def get_forecasts_endpoint():
    return get_forecasts()

@router.delete("/forecasts/{forecast_id}")
def delete_forecast(forecast_id: int):
    from backend.service.forecast_service import delete_forecast
    return delete_forecast(forecast_id)
