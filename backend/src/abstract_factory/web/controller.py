from flask import Blueprint, jsonify, request
from src.abstract_factory.application.service import CatalogService
from src.abstract_factory.infrastructure.mysql import MySQLFactory
from src.abstract_factory.infrastructure.mongo import MongoFactory

bp_abstract_factory = Blueprint("abstract_factory", __name__, url_prefix="/abstract-factory")


@bp_abstract_factory.get("/")
def listar():
    db = request.args.get("db", "mysql").lower()
    factories = {"mysql": MySQLFactory, "mongo": MongoFactory}
    if db not in factories:
        return jsonify({"error": "Usa db=mysql o db=mongo"}), 400
    return jsonify({"base_datos": db, **CatalogService(factories[db]()).consultar()})
