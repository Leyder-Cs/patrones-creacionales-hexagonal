from src.abstract_factory.application.contracts import Repository, RepositoryFactory
from src.config.mysql_conecction import conectar


class MySQLRepository(Repository):
    def __init__(self, tabla):
        self.tabla = tabla

    def listar(self):
        # Lista cerrada: nunca se acepta una tabla arbitraria del usuario.
        if self.tabla not in ("products", "orders"):
            raise ValueError("Tabla no permitida")
        with conectar() as conn:
            with conn.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {self.tabla}")
                filas = cursor.fetchall()
        # PyMySQL devuelve Decimal para precios, que Flask serializa en JSON
        # como cadena; convertirlos para conservar números en React.
        from decimal import Decimal
        return [{k: float(v) if isinstance(v, Decimal) else v
                 for k, v in fila.items()} for fila in filas]


class MySQLFactory(RepositoryFactory):
    def productos(self):
        return MySQLRepository("products")

    def pedidos(self):
        return MySQLRepository("orders")
