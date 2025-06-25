from fastapi import APIRouter, Body
from backend.service.category_service import create_category, get_categories, update_category, delete_category

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", summary="Kategori oluştur")
def create_category_endpoint(name: str = Body(..., embed=True)):
    return create_category(name)

@router.get("/", summary="Kategorileri getir")
def get_categories_endpoint():
    return get_categories()

@router.put("/{category_id}", summary="Kategori güncelle")
def update_category_endpoint(category_id: int, name: str = Body(..., embed=True)):
    return update_category(category_id, name)

@router.delete("/{category_id}", summary="Kategori sil")
def delete_category_endpoint(category_id: int):
    return delete_category(category_id)
