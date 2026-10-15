import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { fetchProductos } from "../actions/products.actions";
import type { ProductApi } from "../interfaces/product.interface";

export default function ProductList() {
  const [productos, setProductos] = useState<ProductApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    fetchProductos()
      .then((data) => {
        if (activo) setProductos(data);
      })
      .catch((e) => {
        if (activo) {
          setError(
            isAxiosError(e) && e.response?.data?.error
              ? e.response.data.error
              : "No se pudieron consultar los productos. Comprueba la conexión con el backend.",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, []);

  return (
    <section id="factory-method" aria-labelledby="factory-method-title" className="space-y-4">
      <div>
        <h1 id="factory-method-title" className="text-xl font-semibold">Factory Method</h1>
        <p className="mt-1 text-sm text-zinc-400">Listado de productos mediante repositorios de acceso a datos.</p>
      </div>
      {cargando && <p role="status" className="text-sm text-zinc-400">Cargando productos...</p>}
      {error && (
        <p role="alert" className="rounded border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {!cargando && !error && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900 text-sm text-zinc-400">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800 last:border-b-0 transition-colors hover:bg-zinc-800/60"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-violet-400">
                    ${Number(p.price).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
