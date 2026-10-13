### BACKEND PYTHON

## Instalación y ejecución

```
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Patrón Factory Method: Parte 1 - Producto

**Archivo:** `src/application/ports/product_repository.py`

### ¿Qué es?

En Factory Method, el **Producto** es la interfaz común de todo lo que la fábrica va a crear. Define **qué** se debe poder hacer, pero no **cómo** se hace.

En este proyecto el producto es el **repositorio de productos**: cualquier cosa que sepa listar productos, sin importar de dónde salgan los datos.

```python
class ProductRepository:
    @staticmethod
    def listar():
        raise NotImplementedError("El repositorio hijo debe implementar listar()")
```

### ¿Para qué sirve?

- **Establece un contrato:** toda clase hija está obligada a implementar `listar()` con ese mismo nombre.
- **Desacopla la aplicación de la base de datos:** el service solo sabe que recibe algo con `listar()`, no si es MySQL, MongoDB o memoria.
- **Permite agregar nuevas fuentes de datos sin modificar lo existente:** solo se crea una clase hija nueva.

Si una hija no implementa `listar()`, se lanza `NotImplementedError`, que avisa que falta cumplir el contrato.

### ¿Dónde está ubicado y por qué?

Está en `application/ports` porque es un **puerto**: lo que la aplicación necesita del exterior. No contiene ningún detalle de MySQL, Mongo ni de otra tecnología, y por eso no va en `infrastructure` y tampoco en `domain`.

## Patrón Factory Method: Parte 2 - Productos concretos

**Archivos:**

- `src/infrastructure/persistence/mysql/product_repository_mysql.py`
- `src/infrastructure/persistence/mongodb/product_repository_mongodb.py`

### ¿Qué son?

Los **productos concretos** son las clases que implementan el contrato del producto (`ProductRepository`). Cada una cumple `listar()` **a su manera**, usando una tecnología distinta.

`ProductRepositoryMySQL` -> Implemental listar -> Abre una conexión con `pymysql`, ejecuta `select * from products` y devuelve `fetchall()`.

`ProductRepositoryMongoDB` -> Implementa listar -> Abre un cliente con `pymongo`, consulta la colección `products` con `find({}, {"_id": 0})` y lo convierte a lista.

```python
class ProductRepositoryMySQL(ProductRepository):
    @staticmethod
    def listar():
        with conectar() as conexion:
            with conexion.cursor() as cursor:
                cursor.execute("select * from products")
                return cursor.fetchall()
```

```python
class ProductRepositoryMongoDB(ProductRepository):
    @staticmethod
    def listar():
        with conectar() as cliente:
            db = cliente[DATABASE]
            return list(db["products"].find({}, {"_id": 0}))
```

### ¿Qué tienen en común?

- **Heredan** de `ProductRepository`, por eso cumplen el contrato.
- **Implementan `listar()`** con el mismo nombre y el mismo `@staticmethod` que define el producto.
- **Devuelven el mismo formato:** una lista de diccionarios con `name`, `price` y `description`. Por eso el service y el frontend no notan de qué base de datos vienen los datos.

### ¿Dónde están ubicados y por qué?

Están en `infrastructure/persistence/<tecnología>`, porque conocen detalles técnicos de una base de datos específica (driver, consultas, conexión). Por eso van separados de la aplicación y cada tecnología tiene su propia carpeta.

### Ventaja

Para agregar otra fuente de datos (memoria, JSON, PostgreSQL) solo se crea **una clase nueva** que herede de `ProductRepository`. El producto, el service y el frontend no se modifican.

## Patrón Factory Method: Parte 3 - Creador

**Archivo:** `src/application/factories/product_repository_creator.py`

### ¿Qué es?

El **Creador** es la clase abstracta que declara el **método de fábrica** (`crear_repositorio`) y contiene la lógica común que se ejecuta con el producto creado. No sabe qué repositorio se va a crear: esa decisión queda en manos de sus clases hijas.

```python
class ProductRepositoryCreator(ABC):
    @abstractmethod
    def crear_repositorio(self):
        pass

    def listar_productos(self):
        repositorio = self.crear_repositorio()
        return ProductService.listar(repositorio)
```

### Sus dos métodos

`crear_repositorio()` es de tipo Abstracto (**Factory Method**) y No tiene código. Obliga a cada creador concreto a decidir qué repositorio devuelve.  
`listar_productos()` tiene (**lógica común**) y Llama al factory method para obtener el repositorio y se lo pasa al `ProductService`. Es igual para todos los creadores.

### ¿Por qué hereda de `ABC`?

`ABC` y `@abstractmethod` convierten la clase en abstracta de verdad:

- **No se puede instanciar directamente**, solo a través de una clase hija.
- **Toda clase hija debe implementar `crear_repositorio()`**. Si no lo hace, Python lanza un error al intentar instanciarla.

### ¿Por qué `listar_productos()` no depende de ninguna base de datos?

Porque nunca nombra una tecnología concreta. Solo hace dos cosas: pedir el repositorio (`self.crear_repositorio()`) y usarlo. Qué repositorio llega (MySQL, MongoDB u otro) lo decide el creador concreto, y por eso este método sirve sin cambios para todos.

### ¿Dónde está ubicado y por qué?

Está en `application/factories`, porque es una abstracción de la aplicación: no conoce ninguna tecnología y solo trabaja con el contrato del producto y con el service. Los detalles concretos viven en `infrastructure`.

## Patrón Factory Method: Parte 4 - Creadores concretos

**Archivos:**

- `src/infrastructure/persistence/mysql/product_repository_mysql_creator.py`
- `src/infrastructure/persistence/mongodb/product_repository_mongodb_creator.py`

### ¿Qué son?

Los **creadores concretos** son las clases hijas del creador (`ProductRepositoryCreator`). Cada una implementa el método de fábrica `crear_repositorio()` y decide **qué producto concreto** se instancia.

```python
class ProductRepositoryMySQLCreator(ProductRepositoryCreator):
    def crear_repositorio(self):
        return ProductRepositoryMySQL()
```

```python
class ProductRepositoryMongoDBCreator(ProductRepositoryCreator):
    def crear_repositorio(self):
        return ProductRepositoryMongoDB()
```

### ¿Qué hacen y qué no hacen?

- **Heredan** de `ProductRepositoryCreator`, por lo que reciben `listar_productos()` ya implementado.
- **Solo implementan `crear_repositorio()`**, el único método abstracto del creador.
- **No repiten la lógica común:** el flujo de `listar_productos()` se escribe una sola vez en el creador general.
- **Son los únicos que hacen la instanciación** (`ProductRepositoryMySQL()`, `ProductRepositoryMongoDB()`), es decir, los únicos que conocen qué clase concreta se crea.

### ¿Dónde están ubicados y por qué?

Están en `infrastructure/persistence/<tecnología>`, junto al producto concreto que instancian. Como importan una implementación específica, no pueden ir en `application`.

### Uso en el controller

El controller elige el creador concreto y llama a la lógica común. Para cambiar de base de datos solo se cambia esa línea pero obviamente podemos usar las 2 dbs si queremos:

```python
creator: ProductRepositoryCreator = ProductRepositoryMySQLCreator()
# creator: ProductRepositoryCreator = ProductRepositoryMongoDBCreator()

productos = creator.listar_productos()
```

El tipo a la izquierda es el creador general y el objeto de la derecha es el creador concreto. El resto del flujo (service, repositorio, respuesta JSON) no cambia.

### Ventaja

Para agregar una nueva fuente de datos se crean **dos clases**: un producto concreto y su creador concreto. El creador general, el service y el frontend no se modifican (principio abierto/cerrado).

### Limitación

El controller sigue importando los creadores concretos, por lo que el acoplamiento se movió de lugar pero no desapareció: alguien debe decidir cuál usar. Aun así, el controller ya no depende directamente de ninguna base de datos.

### FLUJO COMPLETO

cuando entramos a la ruta en productos el controller ejecuta esto:

```python
   creator = ProductRepositoryMySQLCreator()
```

Elige el reclutador

#### FRONTEND REACT + VITE + TYPESCRIPT

# Frontend - Productos (React + Vite + TypeScript)

Interfaz que consume la API de productos del backend (Flask) y los muestra en una tabla.

## Tecnologías

- **React** con **TypeScript**
- **Vite** (servidor de desarrollo y build)
- **Axios** (peticiones HTTP)
- **Tailwind CSS** (estilos)

## Estructura

```
frontend/
├── .env
└── src/
    ├── api/
    │   └── products.api.ts          # instancia de axios (URL base del backend)
    ├── actions/
    │   └── products.actions.ts      # fetchProductos(): pide los productos
    ├── interfaces/
    │   └── product.interface.ts     # tipo ProductApi
    ├── App.tsx                      # componente que pinta la tabla
    ├── index.css                    # Tailwind y estilos globales
    └── main.tsx
```

| Carpeta       | Responsabilidad                                           |
| ------------- | --------------------------------------------------------- |
| `api/`        | Configura cómo hablar con el backend (URL base, timeout). |
| `actions/`    | Las acciones de la app, por ejemplo traer los productos.  |
| `interfaces/` | Los tipos de TypeScript de los datos que llegan.          |

## Cómo fluyen los datos

```
App.tsx → fetchProductos() → axios → Flask (GET /productos/) → JSON → tabla
```

1. `App.tsx` guarda los productos en un estado (`useState`), vacío al inicio.
2. Un `useEffect` con `[]` llama a `fetchProductos()` una sola vez al cargar.
3. Cuando llega la respuesta, se guarda en el estado y React pinta las filas con `.map()`.

## Configuración

Crear un archivo `.env` dentro de `frontend/`, al lado de `package.json`:

```
VITE_API_URL=http://localhost:5000
```

Las variables de Vite deben empezar con `VITE_`. Si se cambia el `.env`, hay que reiniciar el servidor.

## Instalación y ejecución

```
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Requisitos del backend

- Flask corriendo en el puerto **5000** (`python app.py`).
- **CORS** habilitado para el origen del frontend (`flask-cors`):

```python
CORS(app, origins=["http://localhost:5173"])
```

- Endpoint `GET /productos/` que devuelva una lista JSON con `name`, `price` y `description`.
