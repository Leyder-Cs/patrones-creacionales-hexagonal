class CatalogService:
    def __init__(self, factory):
        self.factory = factory

    def consultar(self):
        return {
            "productos": self.factory.productos().listar(),
            "pedidos": self.factory.pedidos().listar(),
        }
