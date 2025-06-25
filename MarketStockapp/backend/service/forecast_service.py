from backend.database import get_db_connection

def get_forecasts():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT forecast_id, product_id, forecast_date, predicted_demand FROM demand_forecasts ORDER BY forecast_date DESC;")
        forecasts = cursor.fetchall()
        return [
            {
                "id": row[0],
                "product_id": row[1],
                "forecast_date": row[2],
                "predicted_demand": row[3],
            }
            for row in forecasts
        ]
    finally:
        cursor.close()
        conn.close()

def delete_forecast(forecast_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM demand_forecasts WHERE forecast_id = %s;", (forecast_id,))
        if cursor.rowcount == 0:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Tahmin bulunamadı.")
        conn.commit()
        return {"message": "Tahmin başarıyla silindi."}
    except Exception as e:
        conn.rollback()
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
