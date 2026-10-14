from abc import ABC, abstractmethod


class Repository(ABC):
    @abstractmethod
    def listar(self):
        pass


class RepositoryFactory(ABC):
    @abstractmethod
    def productos(self) -> Repository:
        pass

    @abstractmethod
    def pedidos(self) -> Repository:
        pass
