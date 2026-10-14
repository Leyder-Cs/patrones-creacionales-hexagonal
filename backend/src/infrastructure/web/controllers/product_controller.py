from flask import Blueprint, jsonify, request

from src.application.factories.product_repository_creator import (
    ProductRepositoryCreator,
)
from src.application.service.product_service import ProductService
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


@dp_products.route("/", methods=["POST"])
def crear_producto():
    data = request.get_json(silent=True) or {}

    try:
        producto = ProductService.construir_producto(data)

        creator: ProductRepositoryCreator = ProductRepositoryMongoDBCreator()
        guardado = creator.guardar_producto(producto)

        return jsonify({
            "mensaje": "Producto construido y guardado correctamente",
            "producto": guardado,
        }), 201

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
