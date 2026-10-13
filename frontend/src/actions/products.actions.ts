import { productClient } from "../api/products.api";
import type {
  ProductApi,
  ProductCreatedResponse,
  ProductInput,
} from "../interfaces/product.interface";

// Solo pide los datos crudos, igual que los entrega Flask
export async function fetchProductos(): Promise<ProductApi[]> {
  const { data } = await productClient.get("/productos/");
  return data;
}

// Envía el producto al Builder del backend y devuelve la respuesta construida
export async function createProducto(
  payload: ProductInput,
): Promise<ProductCreatedResponse> {
  const { data } = await productClient.post("/productos/", payload);
  return data;
}