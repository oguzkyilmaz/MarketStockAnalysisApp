from fastapi import APIRouter
from backend.models.models import Sale
from backend.service.sales_service import create_sale, update_sale, get_all_sales, get_sale_by_id, delete_sale

router = APIRouter()

# Yeni satış ekleme
@router.post("/sales/")
async def create_sale_endpoint(sale: Sale):
    return await create_sale(sale)

# Satış güncelleme
@router.put("/sales/{sale_id}")
async def update_sale_endpoint(sale_id: int, sale: Sale):
    return await update_sale(sale_id, sale)

# Tüm satışları getirme
@router.get("/sales/")
async def get_all_sales_endpoint():
    return await get_all_sales()

# Belirli bir satışı getirme
@router.get("/sales/{sale_id}")
async def get_sale_by_id_endpoint(sale_id: int):
    return await get_sale_by_id(sale_id)

# Satış silme
@router.delete("/sales/{sale_id}")
async def delete_sale_endpoint(sale_id: int):
    return await delete_sale(sale_id)

from backend.service.sales_service import get_sales_data_for_product

@router.get("/sales/monthly/{product_id}")
async def monthly_sales(product_id: int):
    return await get_sales_data_for_product(product_id)