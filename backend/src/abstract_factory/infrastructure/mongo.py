from src.abstract_factory.application.contracts import Repository, RepositoryFactory
from src.config.mongo_conecction import conectar, DATABASE


class MongoRepository(Repository):
    def __init__(self, coleccion):
        self.coleccion = coleccion

    def listar(self):
        with conectar() as cliente:
            return list(cliente[DATABASE][self.coleccion].find({}, {"_id": 0}))


class MongoFactory(RepositoryFactory):
    def productos(self):
        return MongoRepository("products")

    def pedidos(self):
        return MongoRepository("orders")
