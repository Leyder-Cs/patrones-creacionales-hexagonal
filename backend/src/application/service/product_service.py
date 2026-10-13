class ProductService:  # Aqui se crea la clase
    @staticmethod  # Estatico sin nesecidad de crear instancia
    def listar(repositorio): 
        data = (
            repositorio.listar()
        )  # se ejecuta la función de listar que viene de persistencia/mysqle
        return data  # y returna la data
