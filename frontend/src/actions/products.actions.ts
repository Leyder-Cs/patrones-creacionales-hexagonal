import { productClient } from "../api/products.api";
import type { ProductApi } from "../interfaces/product.interface";

// Solo pide los datos crudos, igual que los entrega Flask
export async function fetchProductos(): Promise<ProductApi[]> {
  const { data } = await productClient.get("/productos/");
  return data;
}