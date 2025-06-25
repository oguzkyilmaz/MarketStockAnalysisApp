from pydantic import BaseModel
from datetime import datetime   

# Ürün modeli
class Product(BaseModel):
    name: str
    category_id: int
    stock_quantity: int
    price: float

# Satış modeli
class Sale(BaseModel):
    product_id: int
    units_sold: int
    created_at: datetime