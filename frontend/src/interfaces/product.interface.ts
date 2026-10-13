// Lo que devuelve el backend: MySQL manda el precio como string y Mongo como número
export interface ProductApi {
  name: string;
  price: number | string;
  description: string;
}