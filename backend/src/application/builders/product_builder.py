from src.domain.models.product import Product


class ProductBuilder:
    def __init__(self):
        self._name = None
        self._price = None
        self._description = ""

    def con_nombre(self, name):
        self._name = name.strip() if isinstance(name, str) else name
        return self

    def con_precio(self, price):
        self._price = price
        return self

    def con_descripcion(self, description):
        self._description = description.strip() if isinstance(description, str) else ""
        return self

    def construir(self):
        if not self._name:
            raise ValueError("El nombre es obligatorio")

        if not isinstance(self._price, (int, float)) or isinstance(self._price, bool):
            raise ValueError("El precio debe ser numérico")

        if self._price < 0:
            raise ValueError("El precio no puede ser negativo")

        return Product(
            name=self._name,
            price=float(self._price),
            description=self._description,
        )
