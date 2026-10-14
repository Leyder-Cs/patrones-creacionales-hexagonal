# La función que crea la conexión a MySQL
# Para usar MySQL en la implementación
from src.config.mysql_conecction import conectar

# El puerto (la clase padre que define el contrato)
# Para heredar y cumplir el contrato
from src.application.ports.product_repository import ProductRepository


# aqui va la clase hija por eso debemos traer la clase padre
class ProductRepositoryMySQL(
    ProductRepository  # Esta clase hereda de ProductRepository y cumple su contrato
):
    @staticmethod  # es el mismo decorador que se uso en el puerto
    def listar():  # es el mismo nombre que se definio en el puerto tiene que tener el mismo nombre
        # Crea la conexión a MySQL segura que la conexión se cierre automáticamente al final (aunque haya error), y conexion Es la variable que contiene la conexión activa
        with conectar() as conexion:  # Crea la conexión a MySQL segura que la conexión se cierre automáticamente al final (aunque haya error), y conexion Es la variable que contiene la conexión activa
            # Asegura que el cursor se cierre automáticamente al final con with, y cursor()Es como un "puntero" que te permite ejecutar consultas y recorrer resultados.
            with conexion.cursor() as cursor:
                # ejecuta la consulta para que le de todos los productos
                cursor.execute("select * from products")
                data = (
                    # Obtiene todos los resultados de la consulta y los devuelve como una lista de diccionarios porque usamos ditcursor
                    cursor.fetchall()
                )  # guardamos lo de la consulta en data y que guarde adsolutamente todo
                return data  # retornamos la data

    @staticmethod  # es el mismo decorador que se uso en el puerto
    def guardar(datos):  # Inserta un producto nuevo en la tabla
        with conectar() as conexion:
            with conexion.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO products (name, price, description) VALUES (%s, %s, %s)",
                    (datos["name"], datos["price"], datos["description"]),
                )
                nuevo_id = cursor.lastrowid
            conexion.commit()
        return {**datos, "id": nuevo_id}

# Todo esto va a retornar la data, esta data se va a ir a service.
