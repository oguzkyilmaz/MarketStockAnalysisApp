import psycopg2

# Veritabanı bağlantı bilgileri
DB_HOST = "localhost"
DB_NAME = "mydatabase"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

# Veritabanına bağlanma fonksiyonu
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn 