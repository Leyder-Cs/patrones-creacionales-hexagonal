# La función que crea la conexión a MongoDB (y el nombre de la base de datos)
# Para usar MongoDB en la implementación
from src.config.mongo_conecction import conectar, DATABASE

# El puerto (la clase padre que define el contrato)
# Para heredar y cumplir el contrato
from src.application.ports.product_repository import ProductRepository


# 2. Parte: Producto concreto Factory Method
# aqui va la clase hija por eso debemos traer la clase padre
class ProductRepositoryMongoDB(
    ProductRepository  # Esta clase hereda de ProductRepository y cumple su contrato
):
    @staticmethod  # es el mismo decorador que se uso en el puerto
    def listar():  # es el mismo nombre que se definio en el puerto tiene que tener el mismo nombre
        # Crea el cliente de MongoDB. Con with se cierra automáticamente al final (aunque haya error)
        with conectar() as cliente:
            # Selecciona la base de datos
            db = cliente[DATABASE]
            # find({}) trae todos los documentos de la colección products (sin filtro).
            # list(...) convierte el cursor en una lista de diccionarios
            # Tiene que ir DENTRO del with, porque con el cliente cerrado el cursor ya no se puede leer.
            data = list(db["products"].find({}, {"_id": 0}))
            return data  # retornamos la data

    @staticmethod
    def guardar(datos):  # Inserta un producto nuevo en la colección
        with conectar() as cliente:
            db = cliente[DATABASE]
            db["products"].insert_one(dict(datos))
            return dict(datos)


# Todo esto va a retornar la data, esta data se va a ir a service
