# Este archivo es la capa de infraestructura más baja: la conexión pura a MySQL

# Librería de Python para conectar a MySQL. Es el driver que traduce Python a protocolo MySQL
import pymysql

HOST = "localhost"
PORT = 3306
USER = "root"
PASSWORD = ""
DATABASE = "productosdb"


def conectar():
    return pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=DATABASE,
        charset="utf8",
        # Hace que los resultados de las consultas se devuelvan como diccionarios (con las columnas como claves) en lugar de tuplas (acceso por índice). Esto hace el código más legible y menos propenso a errores.
        cursorclass=pymysql.cursors.DictCursor,
        # Define el tiempo máximo en segundos que PyMySQL esperará para establecer la conexión con MySQL. Si supera ese tiempo, lanza una excepción en lugar de quedarse esperando infinitamente.
        connect_timeout=5,
        #  Desactiva el guardado automático de cambios. Las operaciones que modifican datos (INSERT, UPDATE, DELETE) no se guardan hasta que llamas explícitamente a conn.commit(). Esto permite usar transacciones y revertir cambios con rollback() si hay errores.
        autocommit=False,
    )
