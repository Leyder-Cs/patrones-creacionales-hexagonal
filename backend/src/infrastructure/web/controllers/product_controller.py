from flask import Blueprint, jsonify

from src.application.factories.product_repository_creator import (
    ProductRepositoryCreator,
)
from src.infrastructure.persistence.mysql.product_repository_mysql_creator import (
    ProductRepositoryMySQLCreator,
)
from src.infrastructure.persistence.mongodb.product_repository_mongodb_creator import (
    ProductRepositoryMongoDBCreator,
)

dp_products = Blueprint("products", __name__, url_prefix="/productos")


@dp_products.route("/")
def listar():
    # Para cambiar de DB solo hay que cambiar esta línea:
    # creator: ProductRepositoryCreator = ProductRepositoryMySQLCreator()
    creator: ProductRepositoryCreator = ProductRepositoryMongoDBCreator()

    productos = creator.listar_productos()
    return jsonify(productos)
