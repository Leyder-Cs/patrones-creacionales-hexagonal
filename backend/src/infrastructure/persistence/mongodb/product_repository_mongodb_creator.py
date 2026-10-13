from src.application.factories.product_repository_creator import (
    ProductRepositoryCreator,
)
from src.infrastructure.persistence.mongodb.product_repository_mongodb import (
    ProductRepositoryMongoDB,
)


# 4. Parte: Creador concreto que hereda del principal
class ProductRepositoryMongoDBCreator(ProductRepositoryCreator):
    def crear_repositorio(self):
        return ProductRepositoryMongoDB()