import { useEffect, useState } from "react";
import { fetchProductos } from "./actions/products.actions"; // ajusta a tu archivo
import type { ProductApi } from "./interfaces/product.interface";

function App() {
  const [productos, setProductos] = useState<ProductApi[]>([]);

  useEffect(() => {
    fetchProductos()
      .then((data) => setProductos(data)) // aquí "llega" el array
      .catch((e) => console.error(e));
  }, []);

  return (
  <div className="max-w-4xl mx-auto p-8">
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 overflow-hidden">
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
  </div>
);
}

export default App;