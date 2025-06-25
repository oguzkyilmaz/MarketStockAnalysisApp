from fastapi import APIRouter
from backend.models.models import Product
from backend.service.product_service import create_product, delete_product, update_product, get_all_products
from backend.service.model_service import get_product_data, train_product_model, predict_next_month

router = APIRouter()

@router.post("/products/")
async def create_product_endpoint(product: Product):
    return await create_product(product)

@router.delete("/products/{product_id}")
async def delete_product_endpoint(product_id: int):
    return await delete_product(product_id)

@router.put("/products/{product_id}")
async def update_product_endpoint(product_id: int, product: Product):
    return await update_product(product_id, product)

@router.get("/products/")
async def get_all_products_endpoint():
    return await get_all_products()

@router.get("/products/{product_id}")
async def get_product_by_id_endpoint(product_id: int):
    return await get_product_data(product_id)

# Ürün için model eğitme endpointi
@router.post("/products/{product_id}/train_model")
async def train_model_endpoint(product_id: int):
    return await train_product_model(product_id)

# Ürün için tahmin endpointi
@router.get("/products/{product_id}/predict")
async def predict_endpoint(product_id: int):
    return await predict_next_month(product_id)
