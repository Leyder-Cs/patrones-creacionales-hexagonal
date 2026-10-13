# Este archivo es la capa de infraestructura más baja: la conexión pura a MongoDB

# Librería de Python para conectar a MongoDB. Es el driver que traduce Python al protocolo de Mongo
from pymongo import MongoClient

HOST = "localhost"
PORT = 27017
USER = None  # Sin autenticación en local; si tu Mongo tiene usuario, pon el string aquí
PASSWORD = None
DATABASE = "productosdb"


def conectar():
    return MongoClient(
        host=HOST,
        port=PORT,
        username=USER,
        password=PASSWORD,
        # Tiempo máximo en milisegundos para establecer la conexión con el servidor.
        # Es el equivalente a connect_timeout de PyMySQL (aquí va en ms, no en segundos).
        connectTimeoutMS=5000,
        # Tiempo máximo en milisegundos para encontrar un servidor disponible.
        # Si Mongo no está corriendo, lanza una excepción en vez de quedarse esperando.
        serverSelectionTimeoutMS=5000,
    )