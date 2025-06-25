from fastapi import HTTPException
from backend.database import get_db_connection
from backend.models.models import Product

async def create_product(product: Product):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO products (name, category_id, stock_quantity, price)
            VALUES (%s, %s, %s, %s)
            RETURNING product_id;
            """,
            (product.name, product.category_id, product.stock_quantity, product.price)
        )
        product_id = cursor.fetchone()[0]
        conn.commit()
        return {"product_id": product_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

async def delete_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM products WHERE product_id = %s;
            """,
            (product_id,)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

async def update_product(product_id: int, product: Product):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE products
            SET name = %s, category_id = %s, stock_quantity = %s, price = %s
            WHERE product_id = %s;
            """,
            (product.name, product.category_id, product.stock_quantity, product.price, product_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"message": "Product updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

async def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT product_id, name, category_id, stock_quantity, price FROM products;")
        products = cursor.fetchall()
        return [
            {
                "product_id": product[0],
                "name": product[1],
                "category_id": product[2],
                "stock_quantity": product[3],
                "price": product[4],
            }
            for product in products
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# async def get_product_by_id(product_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute(
#             "SELECT product_id, name, category_id, stock_quantity, price FROM products WHERE product_id = %s;",
#             (product_id,)
#         )
#         product = cursor.fetchone()
#         if product is None:
#             raise HTTPException(status_code=404, detail="Product not found")
#         return {
#             "product_id": product[0],
#             "name": product[1],
#             "category_id": product[2],
#             "stock_quantity": product[3],
#             "price": product[4],
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         cursor.close()
#         conn.close()

