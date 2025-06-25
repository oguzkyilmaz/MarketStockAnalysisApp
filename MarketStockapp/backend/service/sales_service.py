from fastapi import HTTPException
from backend.models.models import Sale
from backend.database import get_db_connection
from datetime import datetime, timedelta

async def create_sale(sale: Sale):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO sales_history (product_id, units_sold)
            VALUES (%s, %s)
            RETURNING sale_id;
            """,
            (sale.product_id, sale.units_sold)
        )
        sale_id = cursor.fetchone()[0]
        cursor.execute(
            """
            UPDATE products SET stock_quantity = stock_quantity - %s WHERE product_id = %s;
            """,
            (sale.units_sold, sale.product_id)
        )
        conn.commit()
        return {"sale_id": sale_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# Satış güncelleme
async def update_sale(sale_id: int, sale: Sale):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Mevcut satış bilgilerini al
        cursor.execute(
            "SELECT units_sold FROM sales_history WHERE sale_id = %s;",
            (sale_id,)
        )
        existing_sale = cursor.fetchone()
        if existing_sale is None:
            raise HTTPException(status_code=404, detail="Sale not found")

        # Kategori güncellemesi için kategori adı kontrolü
        category_id = None
        if hasattr(sale, 'category_name') and sale.category_name:
            # Kategori var mı kontrol et
            cursor.execute("SELECT category_id FROM categories WHERE name = %s;", (sale.category_name,))
            cat = cursor.fetchone()
            if cat:
                category_id = cat[0]
            else:
                # Yoksa ekle
                cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id;", (sale.category_name,))
                category_id = cursor.fetchone()[0]
        else:
            # Kategori adı verilmediyse mevcut üründen al
            cursor.execute("SELECT category_id FROM products WHERE product_id = %s;", (sale.product_id,))
            prod = cursor.fetchone()
            if prod:
                category_id = prod[0]
            else:
                raise HTTPException(status_code=404, detail="Product not found for category update")

        # Stok miktarını güncelle
        units_sold_difference = sale.units_sold - existing_sale[0]
        # Fiyat güncellemesi
        price = getattr(sale, 'price', None)
        if price is not None:
            cursor.execute(
                """
                UPDATE products
                SET stock_quantity = stock_quantity - %s, price = %s, category_id = %s
                WHERE product_id = %s;
                """,
                (units_sold_difference, price, category_id, sale.product_id)
            )
        else:
            cursor.execute(
                """
                UPDATE products
                SET stock_quantity = stock_quantity - %s, category_id = %s
                WHERE product_id = %s;
                """,
                (units_sold_difference, category_id, sale.product_id)
            )

        # Satış kaydını güncelle
        cursor.execute(
            """
            UPDATE sales_history
            SET product_id = %s, units_sold = %s
            WHERE sale_id = %s;
            """,
            (sale.product_id, sale.units_sold, sale_id)
        )
        conn.commit()
        return {"message": "Sale updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Tüm satışları getirme

async def get_all_sales():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT sale_id, product_id, units_sold, created_at FROM sales_history;")
        sales = cursor.fetchall()
        return [
            {
                "sale_id": sale[0],
                "product_id": sale[1],
                "units_sold": sale[2],
                "created_at": sale[3],
            }
            for sale in sales
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Belirli bir satışı getirme
async def get_sale_by_id(sale_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT sale_id, product_id, units_sold FROM sales_history WHERE sale_id = %s;",
            (sale_id,)
        )
        sale = cursor.fetchone()
        if sale is None:
            raise HTTPException(status_code=404, detail="Sale not found")
        return {
            "sale_id": sale[0],
            "product_id": sale[1],
            "units_sold": sale[2],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Satış silme
async def delete_sale(sale_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT product_id FROM sales_history WHERE sale_id = %s;",
            (sale_id,)
        )
        sale = cursor.fetchone()
        if sale is None:
            raise HTTPException(status_code=404, detail="Sale not found")

        # Stok miktarını geri ekle
        cursor.execute(
            """
            UPDATE products
            SET stock_quantity = stock_quantity + %s
            WHERE product_id = %s;
            """,
            (sale[0], sale[0])
        )

        # Satış kaydını sil
        cursor.execute(
            "DELETE FROM sales_history WHERE sale_id = %s;",
            (sale_id,)
        )
        conn.commit()
        return {"message": "Sale deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

async def get_sales_data_for_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT DATE_TRUNC('month', created_at) AS year_month, SUM(units_sold) AS total_units_sold
            FROM sales_history
            WHERE product_id = %s
            GROUP BY year_month
            ORDER BY year_month ASC
        ''', (product_id,))
        rows = cursor.fetchall()
        result = [
            {
                "year_month": row[0].strftime("%Y-%m") if hasattr(row[0], 'strftime') else str(row[0])[:7],
                "total_units_sold": row[1]
            }
            for row in rows
        ]
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()