import psycopg2

# connects fastAPI with PostgreSQL
def get_conn():

    conn = psycopg2.connect(
        host="localhost",
        database="yieldsense_db",
        user="postgres",
        password="Lovely@123",
        port="5432"
    )

    return conn