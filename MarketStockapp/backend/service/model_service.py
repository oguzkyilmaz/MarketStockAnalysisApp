from fastapi import HTTPException
import os
import numpy as np
from xgboost import XGBRegressor
import joblib
from backend.database import get_db_connection

MODELS_DIR = os.path.join(os.path.dirname(__file__), '../ml_models')
os.makedirs(MODELS_DIR, exist_ok=True)

from backend.service.sales_service import get_sales_data_for_product  # Aylık toplam satışları getirir

async def get_product_data(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT name, category_id, stock_quantity, price FROM products WHERE product_id = %s;", (product_id,))
        product_row = cursor.fetchone()
        if product_row is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return product_row
    finally:
        cursor.close()
        conn.close()

async def train_product_model(product_id: int):
    sales_data = await get_sales_data_for_product(product_id)
    if len(sales_data) < 2:
        raise HTTPException(status_code=400, detail="Yeterli satış verisi yok.")
    dates = [row['year_month'] for row in sales_data]
    units = [row['total_units_sold'] for row in sales_data]
    from datetime import datetime
    days = []
    months = []
    years = []
    for d in dates:
        if isinstance(d, str):
            if len(d) == 7:
                dt = datetime.strptime(d, "%Y-%m")
            else:
                dt = datetime.strptime(d, "%Y-%m-%d %H:%M:%S")
        else:
            dt = d
        days.append(dt.day)
        months.append(dt.month)
        years.append(dt.year)

    lag_1 = [0] + units[:-1]
    lag_2 = [0, 0] + units[:-2]
    lag_3 = [0, 0, 0] + units[:-3]
    X = np.column_stack([lag_1, lag_2, lag_3])
    y = np.array(units)
    model = XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=6, random_state=42)
    model.fit(X, y)
    model_path = os.path.join(MODELS_DIR, f"model_{product_id}.pkl")
    joblib.dump(model, model_path)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            '''INSERT INTO product_models (product_id, model_path, model_type, trained_at, updated_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (product_id) DO UPDATE SET model_path = EXCLUDED.model_path, updated_at = CURRENT_TIMESTAMP''',
            (product_id, model_path, 'XGBRegressor')
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()
    return {"message": "Model başarıyla eğitildi.", "model_path": model_path}

async def predict_next_month(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'SELECT model_path FROM product_models WHERE product_id = %s', (product_id,)
        )
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Model bulunamadı.")
        model_path = result[0]
    finally:
        cursor.close()
        conn.close()
    sales_data = await get_sales_data_for_product(product_id)
    if len(sales_data) < 4:
        raise HTTPException(status_code=400, detail="Yeterli aylık satış verisi yok (en az 4 ay olmalı).")
 
    units = [row['total_units_sold'] for row in sales_data]

    lag_1 = [0] + units[:-1]
    lag_2 = [0, 0] + units[:-2]
    lag_3 = [0, 0, 0] + units[:-3]
    X = np.column_stack([lag_1[3:], lag_2[3:], lag_3[3:]])  
    y = np.array(units[3:])
    model = XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=6, random_state=42)
    model.fit(X, y)
    model_path = os.path.join(MODELS_DIR, f"model_{product_id}.pkl")
    joblib.dump(model, model_path)

    last_units_sold = units[-1]
    last2_units_sold = units[-2]
    last3_units_sold = units[-3]
    X_pred = np.array([[last_units_sold, last2_units_sold, last3_units_sold]])

    from datetime import datetime
    last_year_month = sales_data[-1]['year_month']  
    if isinstance(last_year_month, str):
        if len(last_year_month) == 7:  
            dt = datetime.strptime(last_year_month, "%Y-%m")
        else:
            dt = datetime.strptime(last_year_month, "%Y-%m-%d %H:%M:%S")
    else:
        dt = last_year_month
    year = dt.year
    month = dt.month
    if month == 12:
        forecast_year = year + 1
        forecast_month = 1
    else:
        forecast_year = year
        forecast_month = month + 1
    forecast_date = datetime(forecast_year, forecast_month, 1)
    model = joblib.load(model_path)
    prediction = model.predict(X_pred)
    predicted = int(round(prediction[0]))
   
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            '''INSERT INTO demand_forecasts (product_id, forecast_date, predicted_demand) VALUES (%s, %s, %s)''',
            (product_id, forecast_date, predicted)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()
    return {"predicted_sales_next_month": predicted, "forecast_date": str(forecast_date)}
