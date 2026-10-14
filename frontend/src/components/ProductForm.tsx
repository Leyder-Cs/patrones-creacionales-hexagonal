import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { createProducto } from "../actions/products.actions";
import type { ProductApi } from "../interfaces/product.interface";

interface ProductFormProps {
  onCreated: () => void;
}

function ProductForm({ onCreated }: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [creado, setCreado] = useState<ProductApi | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");
    setError("");
    setCreado(null);
    setEnviando(true);

    try {
      const respuesta = await createProducto({
        name,
        price: Number(price),
        description,
      });

      setMensaje(respuesta.mensaje);
      setCreado(respuesta.producto);
      setName("");
      setPrice("");
      setDescription("");
      onCreated();
    } catch (e) {
      if (isAxiosError(e) && e.response?.data?.error) {
        setError(e.response.data.error);
      } else {
        setError("No se pudo conectar con el backend");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-6">
      <h1 className="text-xl font-semibold text-zinc-100">
        Crear producto con Builder
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        El backend valida los datos paso a paso con el patrón Builder.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Teclado mecánico"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Precio
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="85000"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Teclado para el laboratorio"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Construyendo..." : "Construir producto"}
        </button>
      </form>

      {mensaje && (
        <p className="mt-4 rounded border border-emerald-700 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-400">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {creado && (
        <pre className="mt-4 overflow-x-auto rounded border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-300">
          {JSON.stringify(creado, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default ProductForm;
