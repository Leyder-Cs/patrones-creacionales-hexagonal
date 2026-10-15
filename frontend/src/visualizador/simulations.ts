export type Pattern = 'builder' | 'factory' | 'abstract';
export type Database = 'mysql' | 'mongo';
export type ProductData = { name: string; price: number; description: string };
export type DiagramNode = { id: string; label: string; detail: string; x: number; y: number; object?: boolean };
export type Step = {
  title: string; from: string; to: string; owner: string; method: string;
  file: string; code: string; explanation: string; data: unknown;
  fields?: Record<string, unknown>; error?: boolean; returns?: boolean;
};
export type Simulation = {
  description: string; nodes: DiagramNode[]; steps: Step[];
  relations: { from: string; to: string; label: string }[];
};

export const names: Record<Pattern, string> = { builder: 'Builder', factory: 'Factory Method', abstract: 'Abstract Factory' };
export const initialProduct: ProductData = { name: 'Teclado mecánico', price: 85000, description: 'Teclado para el laboratorio' };
const node = (id: string, label: string, detail: string, x: number, y: number, object = false): DiagramNode => ({ id, label, detail, x, y, object });
const products = [initialProduct];
const orders = [{ customer: 'Daniel', total: 85000 }];
const controller = 'backend/src/infrastructure/web/controllers/product_controller.py';
const service = 'backend/src/application/service/product_service.py';
const creator = 'backend/src/application/factories/product_repository_creator.py';
const builder = 'backend/src/application/builders/product_builder.py';
const mongoRepo = 'backend/src/infrastructure/persistence/mongodb/product_repository_mongodb.py';
const af = 'backend/src/abstract_factory/';

export function makeSimulation(pattern: Pattern, db: Database, sample: ProductData, failed: boolean): Simulation {
  if (pattern === 'builder') {
    const input = { ...sample, price: failed ? -1 : sample.price };
    const fields: Record<string, unknown> = { _name: null, _price: null, _description: '' };
    const steps: Step[] = [
      { title: 'Preparar los atributos', from: 'react', to: 'react', owner: 'ProductForm', method: 'handleSubmit()', file: 'frontend/src/components/ProductForm.tsx', code: 'const respuesta = await createProducto({\n  name,\n  price: Number(price),\n  description,\n});', explanation: 'React prepara el producto introducido en el formulario. Los datos de este recorrido son ilustrativos.', data: input },
      { title: 'Enviar la petición', from: 'react', to: 'controller', owner: 'product_controller.py', method: 'crear_producto()', file: controller, code: '@dp_products.route("/", methods=["POST"])\ndef crear_producto():\n    data = request.get_json(silent=True) or {}', explanation: 'POST /productos/ entrega el JSON al controlador Flask.', data: input },
      { title: 'Delegar la construcción', from: 'controller', to: 'service', owner: 'ProductService', method: 'construir_producto(data)', file: controller, code: 'producto = ProductService.construir_producto(data)', explanation: 'El controlador delega la construcción al servicio de aplicación.', data: input },
      { title: 'Inicializar el Builder', from: 'service', to: 'builder', owner: 'ProductBuilder', method: '__init__()', file: builder, code: 'def __init__(self):\n    self._name = None\n    self._price = None\n    self._description = ""', explanation: 'El Builder almacena un borrador. La instancia Product todavía no existe.', data: { ...fields }, fields: { ...fields } },
    ];
    const operations = [
      { field: '_name', value: input.name.trim(), method: 'con_nombre', argument: 'name', code: 'self._name = name.strip() if isinstance(name, str) else name' },
      { field: '_price', value: input.price, method: 'con_precio', argument: 'price', code: 'self._price = price' },
      { field: '_description', value: input.description.trim(), method: 'con_descripcion', argument: 'description', code: 'self._description = description.strip() if isinstance(description, str) else ""' },
    ];
    for (const op of operations) {
      fields[op.field] = op.value;
      steps.push({ title: `Incorporar ${op.argument}`, from: 'builder', to: 'builder', owner: 'ProductBuilder', method: `${op.method}(${op.argument})`, file: builder, code: `def ${op.method}(self, ${op.argument}):\n    ${op.code}\n    return self`, explanation: 'Se incorpora el atributo y se devuelve el mismo Builder para encadenar la siguiente operación.', data: { ...fields }, fields: { ...fields } });
    }
    const built = { name: input.name.trim(), price: input.price, description: input.description.trim() };
    steps.push({ title: failed ? 'Validación fallida' : 'Validar los atributos', from: 'builder', to: 'builder', owner: 'ProductBuilder', method: 'construir()', file: builder, code: 'if not self._name:\n    raise ValueError("El nombre es obligatorio")\nif not isinstance(self._price, (int, float)) or isinstance(self._price, bool):\n    raise ValueError("El precio debe ser numérico")\nif self._price < 0:\n    raise ValueError("El precio no puede ser negativo")', explanation: failed ? 'El precio -1 activa el ValueError real. No se crea Product ni se llama a persistencia.' : 'El nombre está presente y el precio es numérico, no booleano y no negativo. Las comprobaciones ocurren en construir().', data: failed ? { error: 'El precio no puede ser negativo' } : { validaciones: 'correctas' }, fields: { ...fields }, error: failed });
    if (failed) {
      steps.push({ title: 'Devolver el error', from: 'builder', to: 'controller', owner: 'product_controller.py', method: 'except ValueError', file: controller, code: 'except ValueError as error:\n    return jsonify({"error": str(error)}), 400', explanation: 'La excepción se propaga a través del servicio hasta el controlador.', data: { error: 'El precio no puede ser negativo' }, error: true, returns: true },
        { title: 'Mostrar el error en React', from: 'controller', to: 'react', owner: 'ProductForm', method: 'handleSubmit() · catch', file: 'frontend/src/components/ProductForm.tsx', code: 'setError(e.response.data.error);', explanation: 'HTTP 400 devuelve el mensaje a React. El recorrido finaliza sin guardar.', data: { status: 400, error: 'El precio no puede ser negativo' }, error: true, returns: true });
    } else {
      steps.push(
        { title: 'Crear la instancia Product', from: 'builder', to: 'product', owner: 'ProductBuilder → Product', method: 'construir()', file: builder, code: 'return Product(\n    name=self._name,\n    price=float(self._price),\n    description=self._description,\n)', explanation: 'Solo después de validar se instancia la dataclass inmutable Product.', data: built },
        { title: 'Devolver el producto al controlador', from: 'product', to: 'controller', owner: 'ProductService', method: 'construir_producto(data) → Product', file: service, code: 'return (\n    ProductBuilder()\n    .con_nombre(data.get("name"))\n    .con_precio(data.get("price"))\n    .con_descripcion(data.get("description", ""))\n    .construir()\n)', explanation: 'El servicio devuelve el objeto construido a crear_producto().', data: built, returns: true },
        { title: 'Entregar al creador de persistencia', from: 'controller', to: 'creator', owner: 'ProductRepositoryMongoDBCreator', method: 'guardar_producto(producto)', file: controller, code: 'creator: ProductRepositoryCreator = ProductRepositoryMongoDBCreator()\nguardado = creator.guardar_producto(producto)', explanation: 'El flujo existente configura el creador MongoDB y usa guardar_producto(), heredado del contrato creador.', data: built },
        { title: 'Fabricar el repositorio', from: 'creator', to: 'repo', owner: 'ProductRepositoryMongoDBCreator', method: 'crear_repositorio()', file: 'backend/src/infrastructure/persistence/mongodb/product_repository_mongodb_creator.py', code: 'def crear_repositorio(self):\n    return ProductRepositoryMongoDB()', explanation: 'guardar_producto() invoca el Factory Method y recibe un repositorio concreto.', data: { repositorio: 'ProductRepositoryMongoDB' } },
        { title: 'Serializar para persistencia', from: 'creator', to: 'service', owner: 'ProductService', method: 'guardar(repositorio, producto)', file: service, code: 'return repositorio.guardar(producto.to_dict())', explanation: 'ProductService convierte Product a diccionario y delega el guardado al repositorio.', data: built },
        { title: 'Delegar al repositorio', from: 'service', to: 'repo', owner: 'ProductRepositoryMongoDB', method: 'guardar(datos)', file: mongoRepo, code: 'def guardar(datos):\n    with conectar() as cliente:\n        db = cliente[DATABASE]\n        db["products"].insert_one(dict(datos))\n        return dict(datos)', explanation: 'El repositorio recibe los datos del producto construido.', data: built },
        { title: 'Persistir el producto', from: 'repo', to: 'db', owner: 'ProductRepositoryMongoDB', method: 'insert_one(dict(datos))', file: mongoRepo, code: 'db["products"].insert_one(dict(datos))', explanation: 'Se ilustra la escritura en products. Esta página nunca ejecuta la inserción.', data: built },
        { title: 'Retornar el resultado del guardado', from: 'repo', to: 'controller', owner: 'ProductRepositoryCreator', method: 'guardar_producto() → guardado', file: creator, code: 'return ProductService.guardar(repositorio, producto)', explanation: 'El diccionario retorna por el servicio y el creador hasta el controlador.', data: built, returns: true },
        { title: 'Confirmar la creación', from: 'controller', to: 'react', owner: 'product_controller.py', method: 'jsonify() · HTTP 201', file: controller, code: 'return jsonify({\n    "mensaje": "Producto construido y guardado correctamente",\n    "producto": guardado,\n}), 201', explanation: 'React recibe la confirmación. En la aplicación real también se vuelve a cargar el listado.', data: { status: 201, producto: built }, returns: true },
      );
    }
    return { description: 'Un borrador, tres atributos y un objeto validado. Observa la construcción y su entrega a persistencia.', nodes: [node('react', 'ProductForm', 'React · entrada y resultado', 150, 90), node('controller', 'product_controller.py', 'Flask · POST /productos/', 460, 90), node('service', 'ProductService', 'Aplicación', 770, 90), node('builder', 'ProductBuilder', 'Construcción progresiva', 770, 255), node('product', 'Product', 'dataclass(frozen=True)', 460, 255, true), node('creator', 'ProductRepositoryMongoDBCreator', 'Factory Method', 150, 255), node('repo', 'ProductRepositoryMongoDB', 'Repositorio concreto', 150, 420, true), node('db', 'MongoDB · products', 'Persistencia ilustrada', 460, 420)], steps, relations: [] };
  }

  if (pattern === 'factory') return {
    description: 'El creador configurado fabrica el repositorio. El servicio consulta y los registros vuelven a React.',
    nodes: [node('react', 'App', 'React · listado de productos', 150, 90), node('controller', 'product_controller.py', 'Flask · GET /productos/', 460, 90), node('creator', 'ProductRepositoryMongoDBCreator', 'Creador concreto configurado', 770, 90), node('contract', 'ProductRepositoryCreator', 'Contrato abstracto · ABC', 770, 255), node('repo', 'ProductRepositoryMongoDB', 'Repositorio creado', 460, 255, true), node('service', 'ProductService', 'Servicio de aplicación', 150, 255), node('db', 'MongoDB · products', 'Colección', 460, 420)],
    relations: [{ from: 'creator', to: 'contract', label: 'hereda' }],
    steps: [
      { title: 'Solicitar productos', from: 'react', to: 'controller', owner: 'App → fetchProductos', method: 'cargarProductos()', file: 'frontend/src/actions/products.actions.ts', code: 'const { data } = await productClient.get("/productos/");\nreturn data;', explanation: 'React solicita el listado. En este visualizador solo se representa la petición.', data: { method: 'GET', ruta: '/productos/' } },
      { title: 'Instanciar el creador configurado', from: 'controller', to: 'creator', owner: 'product_controller.py', method: 'listar()', file: controller, code: 'creator: ProductRepositoryCreator = ProductRepositoryMongoDBCreator()', explanation: 'El controlador actual usa MongoDB. La alternativa MySQL está comentada en el código; no existe selector HTTP.', data: { creator: 'ProductRepositoryMongoDBCreator' } },
      { title: 'Ejecutar la operación heredada', from: 'controller', to: 'creator', owner: 'ProductRepositoryCreator', method: 'listar_productos()', file: creator, code: 'def listar_productos(self):\n    repositorio = self.crear_repositorio()\n    return ProductService.listar(repositorio)', explanation: 'El creador concreto ejecuta listar_productos(), heredado de ProductRepositoryCreator. La línea discontinua solo representa herencia.', data: { self: 'ProductRepositoryMongoDBCreator' } },
      { title: 'Crear el repositorio concreto', from: 'creator', to: 'repo', owner: 'ProductRepositoryMongoDBCreator', method: 'crear_repositorio()', file: 'backend/src/infrastructure/persistence/mongodb/product_repository_mongodb_creator.py', code: 'def crear_repositorio(self):\n    return ProductRepositoryMongoDB()', explanation: 'El despacho dinámico invoca el Factory Method concreto. Aparece un nuevo objeto repositorio.', data: { objeto_creado: 'ProductRepositoryMongoDB' } },
      { title: 'Entregar el repositorio al servicio', from: 'creator', to: 'service', owner: 'ProductRepositoryCreator', method: 'ProductService.listar(repositorio)', file: creator, code: 'return ProductService.listar(repositorio)', explanation: 'El creador entrega la instancia al servicio, que usa el contrato del repositorio.', data: { repositorio: 'ProductRepositoryMongoDB' } },
      { title: 'Delegar la consulta', from: 'service', to: 'repo', owner: 'ProductService', method: 'listar(repositorio)', file: service, code: 'data = (\n    repositorio.listar()\n)\nreturn data', explanation: 'El servicio invoca listar() sobre el repositorio recibido.', data: { metodo: 'repositorio.listar()' } },
      { title: 'Leer la colección', from: 'repo', to: 'db', owner: 'ProductRepositoryMongoDB', method: 'listar()', file: mongoRepo, code: 'data = list(db["products"].find({}, {"_id": 0}))\nreturn data', explanation: 'El repositorio lee products y excluye _id. Los registros mostrados son ejemplos locales.', data: { coleccion: 'products', filtro: {}, proyeccion: { _id: 0 } } },
      { title: 'Recibir los registros', from: 'db', to: 'repo', owner: 'ProductRepositoryMongoDB', method: 'find() → list', file: mongoRepo, code: 'return data', explanation: 'Los documentos se materializan como lista dentro del contexto de conexión.', data: products, returns: true },
      { title: 'Retornar al servicio', from: 'repo', to: 'service', owner: 'ProductService', method: 'listar() → data', file: service, code: 'return data', explanation: 'La lista regresa al servicio sin transformación.', data: products, returns: true },
      { title: 'Retornar al creador', from: 'service', to: 'creator', owner: 'ProductRepositoryCreator', method: 'listar_productos() → productos', file: creator, code: 'return ProductService.listar(repositorio)', explanation: 'Finaliza la operación común del creador.', data: products, returns: true },
      { title: 'Serializar en Flask', from: 'creator', to: 'controller', owner: 'product_controller.py', method: 'jsonify(productos)', file: controller, code: 'productos = creator.listar_productos()\nreturn jsonify(productos)', explanation: 'El controlador convierte el resultado en la respuesta JSON.', data: products, returns: true },
      { title: 'Actualizar la tabla', from: 'controller', to: 'react', owner: 'App', method: 'setProductos(data)', file: 'frontend/src/App.tsx', code: '.then((data) => setProductos(data))', explanation: 'React actualiza el estado y muestra el listado. Termina el recorrido.', data: products, returns: true },
    ],
  };

  const factory = db === 'mysql' ? 'MySQLFactory' : 'MongoFactory';
  const repository = db === 'mysql' ? 'MySQLRepository' : 'MongoRepository';
  const impl = `${af}infrastructure/${db}.py`;
  const result = { base_datos: db, productos: products, pedidos: orders };
  const steps: Step[] = [
    { title: 'Solicitar el catálogo', from: 'react', to: 'controller', owner: 'controller.py', method: 'listar()', file: `${af}web/controller.py`, code: 'db = request.args.get("db", "mysql").lower()', explanation: `React solicita GET /abstract-factory/?db=${db}. Flask lee el parámetro db.`, data: { db } },
    { title: 'Seleccionar e instanciar la fábrica', from: 'controller', to: 'factory', owner: 'controller.py', method: 'factories[db]()', file: `${af}web/controller.py`, code: 'factories = {"mysql": MySQLFactory, "mongo": MongoFactory}', explanation: `Se selecciona ${factory} y se crea su instancia. Su relación con RepositoryFactory es estructural.`, data: { factory } },
    { title: 'Instanciar el servicio', from: 'controller', to: 'service', owner: 'CatalogService', method: '__init__(factory)', file: `${af}application/service.py`, code: 'def __init__(self, factory):\n    self.factory = factory', explanation: 'El controlador inyecta la fábrica concreta en CatalogService.', data: { 'self.factory': factory } },
    { title: 'Consultar el catálogo', from: 'controller', to: 'service', owner: 'CatalogService', method: 'consultar()', file: `${af}application/service.py`, code: 'def consultar(self):\n    return {\n        "productos": self.factory.productos().listar(),\n        "pedidos": self.factory.pedidos().listar(),\n    }', explanation: 'Python evalúa primero productos y después pedidos, de izquierda a derecha en este diccionario.', data: { productos: 'pendiente', pedidos: 'pendiente' } },
  ];
  for (const [kind, collection, records] of [['productos', 'products', products], ['pedidos', 'orders', orders]] as const) {
    const id = collection === 'products' ? 'productsRepo' : 'ordersRepo';
    const storage = collection === 'products' ? 'productsDb' : 'ordersDb';
    steps.push(
      { title: `Solicitar repositorio de ${kind}`, from: 'service', to: 'factory', owner: 'CatalogService', method: `factory.${kind}()`, file: `${af}application/service.py`, code: `"${kind}": self.factory.${kind}().listar(),`, explanation: `El servicio solicita a la fábrica de su familia un repositorio de ${kind}.`, data: { factory, metodo: `${kind}()` } },
      { title: `Crear ${repository}("${collection}")`, from: 'factory', to: id, owner: factory, method: `${kind}()`, file: impl, code: `def ${kind}(self):\n    return ${repository}("${collection}")`, explanation: `Aparece un objeto ${repository} para ${collection}. Cada llamada crea una instancia distinta de la misma familia.`, data: { objeto_creado: `${repository}("${collection}")` } },
      { title: `Invocar listar() de ${kind}`, from: 'service', to: id, owner: 'CatalogService', method: `${kind}().listar()`, file: `${af}application/service.py`, code: `"${kind}": self.factory.${kind}().listar(),`, explanation: 'El objeto devuelto cumple Repository. El servicio llama listar() sobre esa instancia.', data: { repositorio: `${repository}("${collection}")` } },
      { title: `Consultar ${collection}`, from: id, to: storage, owner: repository, method: 'listar()', file: impl, code: db === 'mysql' ? 'cursor.execute(f"SELECT * FROM {self.tabla}")\nfilas = cursor.fetchall()' : 'return list(cliente[DATABASE][self.coleccion].find({}, {"_id": 0}))', explanation: db === 'mysql' ? `SELECT * consulta la tabla ${collection}; después se normalizan los Decimal a float.` : `find() consulta ${collection} y omite _id.`, data: { [db === 'mysql' ? 'tabla' : 'coleccion']: collection } },
      { title: `Recuperar ${kind}`, from: storage, to: id, owner: repository, method: 'listar() · registros', file: impl, code: db === 'mysql' ? 'return [{k: float(v) if isinstance(v, Decimal) else v\n         for k, v in fila.items()} for fila in filas]' : 'return list(cliente[DATABASE][self.coleccion].find({}, {"_id": 0}))', explanation: 'Los registros regresan al repositorio. Estos datos son ilustrativos y no provienen de una conexión real.', data: records, returns: true },
      { title: `Entregar ${kind} al servicio`, from: id, to: 'service', owner: 'CatalogService', method: `consultar() · ${kind}`, file: `${af}application/service.py`, code: `"${kind}": self.factory.${kind}().listar(),`, explanation: kind === 'productos' ? 'Termina la consulta de productos; ahora se evalúa pedidos.' : 'Termina pedidos. El diccionario ya contiene ambos resultados.', data: kind === 'productos' ? { productos: products } : { productos: products, pedidos: orders }, returns: true },
    );
  }
  steps.push(
    { title: 'Agrupar y devolver el catálogo', from: 'service', to: 'controller', owner: 'CatalogService → controller.py', method: 'consultar() → jsonify()', file: `${af}web/controller.py`, code: 'return jsonify({"base_datos": db, **CatalogService(factories[db]()).consultar()})', explanation: 'El servicio devuelve las dos listas. Flask añade base_datos y serializa el JSON.', data: result, returns: true },
    { title: 'Actualizar la visualización', from: 'controller', to: 'react', owner: 'React · Abstract Factory', method: 'setData', file: 'frontend/src/abstract-factory/main.tsx', code: '.then(setData)', explanation: 'React recibe el catálogo y actualiza las tablas de productos y pedidos.', data: result, returns: true },
  );
  return { description: 'Una fábrica, dos repositorios de la misma familia. Sigue productos y luego pedidos, en el orden del código.', nodes: [node('react', 'React', 'Productos y pedidos', 150, 70), node('controller', 'controller.py', `GET · db=${db}`, 460, 70), node('service', 'CatalogService', 'consultar()', 770, 70), node('factoryContract', 'RepositoryFactory', 'Contrato abstracto · ABC', 150, 215), node('factory', factory, 'productos() · pedidos()', 460, 215), node('repoContract', 'Repository', 'Contrato · listar()', 770, 215), node('productsRepo', `${repository}("products")`, 'Objeto de la familia', 255, 345, true), node('ordersRepo', `${repository}("orders")`, 'Objeto de la familia', 665, 345, true), node('productsDb', `${db === 'mysql' ? 'MySQL' : 'MongoDB'} · products`, db === 'mysql' ? 'Tabla' : 'Colección', 255, 465), node('ordersDb', `${db === 'mysql' ? 'MySQL' : 'MongoDB'} · orders`, db === 'mysql' ? 'Tabla' : 'Colección', 665, 465)], relations: [{ from: 'factory', to: 'factoryContract', label: 'hereda' }, { from: 'productsRepo', to: 'repoContract', label: 'implementa' }, { from: 'ordersRepo', to: 'repoContract', label: 'implementa' }], steps };
}
