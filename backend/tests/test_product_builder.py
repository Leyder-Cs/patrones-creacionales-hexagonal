import pytest
from unittest.mock import patch

from app import app
from src.application.builders.product_builder import ProductBuilder
from src.application.service.product_service import ProductService


def test_construye_un_producto_correctamente():
    producto = (
        ProductBuilder()
        .con_nombre("Teclado")
        .con_precio(85000)
        .con_descripcion("Teclado mecánico")
        .construir()
    )

    assert producto.name == "Teclado"
    assert producto.price == 85000.0
    assert producto.description == "Teclado mecánico"


def test_falla_si_no_hay_nombre():
    with pytest.raises(ValueError, match="nombre es obligatorio"):
        ProductBuilder().con_precio(50000).construir()


def test_falla_si_el_precio_es_negativo():
    with pytest.raises(ValueError, match="no puede ser negativo"):
        ProductBuilder().con_nombre("Mouse").con_precio(-1).construir()


def test_falla_si_el_precio_no_es_numerico():
    with pytest.raises(ValueError, match="precio debe ser numérico"):
        ProductBuilder().con_nombre("Mouse").con_precio("caro").construir()


def test_servicio_guarda_en_el_repositorio():
    guardados = []

    class RepositorioFalso:
        @staticmethod
        def guardar(datos):
            guardados.append(datos)
            return datos

    producto = (
        ProductBuilder().con_nombre("Monitor").con_precio(1200000).construir()
    )

    resultado = ProductService.guardar(RepositorioFalso(), producto)

    assert guardados[0]["name"] == "Monitor"
    assert resultado["price"] == 1200000.0


def test_endpoint_crea_producto_con_builder():
    cliente = app.test_client()

    with patch(
        "src.infrastructure.web.controllers.product_controller."
        "ProductRepositoryMongoDBCreator.guardar_producto",
        return_value={
            "name": "Mouse",
            "price": 45000.0,
            "description": "Mouse USB",
        },
    ):
        respuesta = cliente.post(
            "/productos/",
            json={
                "name": "Mouse",
                "price": 45000,
                "description": "Mouse USB",
            },
        )

    assert respuesta.status_code == 201
    assert respuesta.json["producto"]["name"] == "Mouse"
    assert respuesta.json["producto"]["price"] == 45000.0
