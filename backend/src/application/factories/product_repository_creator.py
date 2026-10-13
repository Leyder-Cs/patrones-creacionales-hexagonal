from abc import ABC, abstractmethod
from src.application.service.product_service import ProductService


# 3. Parte: Creador (Factory Method)
# Hereda de ABC (abstract base class) para convertir esta clase en abstract-
# Esta clase define la palntilla, o estructura que debe seguir todos
# Los creadores de repositorios especificos
class ProductRepositoryCreator(ABC):
    # Metodo de fabricación
    # El decorador hacer que cualquier subclase que herede de
    # productRepositoryCreator a implementar y escribir este metodo
    # No tiene codigo porque no sabe que base de datos va a utilizar
    @abstractmethod
    def crear_repositorio(self):
        pass

    # Lógica en común que van a tener todos los tipos de repositorio
    # Este metodo contiene el flujo de trabajo para todos los creadores
    # No se acoplama una sola base de datos
    def listar_productos(self):
        repositorio = self.crear_repositorio()  # llama a nuestro factory method
        return ProductService.listar(repositorio)  # Ahora con esto listamos
