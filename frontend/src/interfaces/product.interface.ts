// Lo que devuelve el backend: MySQL manda el precio como string y Mongo como número
export interface ProductApi {
  name: string;
  price: number | string;
  description: string;
}

// Lo que envía el formulario al endpoint POST /productos/
export interface ProductInput {
  name: string;
  price: number;
  description: string;
}

// Respuesta del Builder cuando construye el producto correctamente
export interface ProductCreatedResponse {
  mensaje: string;
  producto: ProductApi;
}