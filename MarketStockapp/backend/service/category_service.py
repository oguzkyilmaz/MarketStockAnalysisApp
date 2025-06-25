from fastapi import HTTPException
from backend.database import get_db_connection
from typing import List

def create_category(name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO categories (name)
            VALUES (%s)
            RETURNING category_id;
            """,
            (name,)
        )
        category_id = cursor.fetchone()[0]
        conn.commit()
        return {"category_id": category_id}
    except Exception as e:
        conn.rollback()

        if 'unique' in str(e).lower():
            raise HTTPException(status_code=400, detail="Kategori adı zaten mevcut.")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def get_categories() -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT category_id, name FROM categories ORDER BY name ASC;")
        categories = cursor.fetchall()
        return [
            {"category_id": cat[0], "name": cat[1]} for cat in categories
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def update_category(category_id: int, name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE categories SET name = %s WHERE category_id = %s;
            """,
            (name, category_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Kategori bulunamadı.")
        conn.commit()
        return {"message": "Kategori başarıyla güncellendi."}
    except Exception as e:
        conn.rollback()
        if 'unique' in str(e).lower():
            raise HTTPException(status_code=400, detail="Kategori adı zaten mevcut.")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def delete_category(category_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM categories WHERE category_id = %s;",
            (category_id,)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Kategori bulunamadı.")
        conn.commit()
        return {"message": "Kategori başarıyla silindi."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
