import { useCallback, useEffect, useState } from "react";
import { fetchProductos } from "./actions/products.actions"; // ajusta a tu archivo
import ProductForm from "./components/ProductForm";
import type { ProductApi } from "./interfaces/product.interface";

function App() {
  const [productos, setProductos] = useState<ProductApi[]>([]);

  const cargarProductos = useCallback(() => {
    fetchProductos()
      .then((data) => setProductos(data)) // aquí "llega" el array
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    cargarProductos();
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [cargarProductos]);

  return (
  <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
    <nav aria-label="Navegación de patrones">
      <a className="back-to-menu" href="/">← Volver al menú principal</a>
      <div className="flex flex-wrap gap-4 text-sm text-violet-300">
        <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="#builder">Builder</a>
        <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="#factory-method">Factory Method</a>
      </div>
    </nav>
    <section id="builder" aria-label="Builder">
      <ProductForm onCreated={cargarProductos} />
    </section>
    <section id="factory-method" aria-labelledby="factory-method-title" className="space-y-4">
      <div>
        <h2 id="factory-method-title" className="text-xl font-semibold">Factory Method</h2>
        <p className="mt-1 text-sm text-zinc-400">Listado de productos mediante repositorios de acceso a datos.</p>
      </div>
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
    </section>
  </main>
);
}

export default App;
