from src.application.factories.product_repository_creator import (
    ProductRepositoryCreator,
)
from src.infrastructure.persistence.mysql.product_repository_mysql import (
    ProductRepositoryMySQL,
)


# 4. Parte: Creador concreto (Factory Method)
# Creador concreto que hereda del principal
class ProductRepositoryMySQLCreator(ProductRepositoryCreator):
    def crear_repositorio(self):
        return ProductRepositoryMySQL()