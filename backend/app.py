# Importa la clase principal de Flask.
# Con ella se crea la aplicación web.
from flask import Flask
from flask_cors import CORS

# Importa el blueprint definido en product_controller.py.
# Ese blueprint contiene las rutas de productos, por ejemplo:
# /productos/
from src.infrastructure.web.controllers.product_controller import dp_products

# Crea la aplicación Flask.
#
# __name__:
# Le indica a Flask desde qué módulo se está ejecutando la aplicación.
# Flask lo usa como referencia para localizar recursos de la app.
#
# template_folder:
# Indica dónde están los archivos HTML/Jinja.
# En este caso: src/views/templates
#
# static_folder=None:
# Desactiva la carpeta estática por defecto de Flask.
# Es decir, Flask no buscará automáticamente una carpeta "static"
# para CSS, JavaScript o imágenes.
app = Flask(__name__, template_folder="src/views/templates", static_folder=None)
# Permite que el frontend en el puerto 5173 le haga peticiones a
CORS(app, origins=["http://localhost:5173"])
# Registra el blueprint de productos dentro de la aplicación.
#
# dp_products fue creado en product_controller.py:
# dp_products = Blueprint("products", __name__, url_prefix="/productos")
#
# Al registrarlo, Flask conoce las rutas definidas en ese controller.
# Por ejemplo:
# @dp_products.route("/")
# URL final: /productos/
app.register_blueprint(dp_products)
# Esta condición verifica que este archivo se esté ejecutando
# directamente con: python app.py
#
# Si app.py fuera importado desde otro archivo, el servidor no arrancaría.
if __name__ == "__main__":

    # Inicia el servidor local de Flask.
    #
    # debug=True:
    # - Muestra errores detallados durante el desarrollo.
    # - Reinicia automáticamente el servidor cuando cambias el código.
    # No se recomienda usarlo en producción.
    app.run(debug=True)


    
