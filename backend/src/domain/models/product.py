from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class Product:
    name: str
    price: float
    description: str = ""

    def to_dict(self):
        return asdict(self)
