from src.application.builders.product_builder import ProductBuilder


class ProductService:  # Aqui se crea la clase
    @staticmethod  # Estatico sin nesecidad de crear instancia
    def listar(repositorio): 
        data = (
            repositorio.listar()
        )  # se ejecuta la función de listar que viene de persistencia/mysqle
        return data  # y returna la data

    @staticmethod
    def construir_producto(data):
        return (
            ProductBuilder()
            .con_nombre(data.get("name"))
            .con_precio(data.get("price"))
            .con_descripcion(data.get("description", ""))
            .construir()
        )

    @staticmethod
    def guardar(repositorio, producto):
        return repositorio.guardar(producto.to_dict())
