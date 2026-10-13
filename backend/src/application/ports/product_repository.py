# Este es el contrato o interfaz que define qué debe hacer cualquier repositorio de productos,
# sin importar cómo lo haga.


#  Aqui van los casos de uso
# No le importa si es MySQL, PostgreSQL, MongoDB, o un archivo JSON
# Se exige que llegue algo
# para declarar ese contrado creamos una clase
# El hijo va en mysql de esta clase padre


# Se crea la clase que sirve como interface
# 1. Parte: Producto (Factory Method)
# Esta es la clase padre abstracta. Define la forma que deben tener todos los repositorios de productos.

class ProductRepository:
    @staticmethod
    def listar():  # Es una obligación este metodo para las clases hijas
        # Si la clase hija no lo implementa este debe lanzar este error
        raise NotImplementedError("El repositorio hijo debe implementar listar()")
