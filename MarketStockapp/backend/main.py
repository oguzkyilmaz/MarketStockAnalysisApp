from fastapi import FastAPI
from backend.routes.product_routes import router as product_router
from backend.routes.sales_routes import router as sales_router
from backend.routes.model_routes import router as model_router
from backend.routes.category_routes import router as category_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için * kullanabilirsiniz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(product_router)
app.include_router(sales_router)
app.include_router(model_router)
app.include_router(category_router)