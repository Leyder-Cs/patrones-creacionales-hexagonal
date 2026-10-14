import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./styles.css";
import "../navigation.css";

type Registro = Record<string, string | number | boolean | null>;
type Resultado = { base_datos: string; productos: Registro[]; pedidos: Registro[] };

const dinero = (valor: unknown) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(Number(valor ?? 0));

function Tabla({ titulo, filas, tipo }: { titulo: string; filas: Registro[]; tipo: "productos" | "pedidos" }) {
  const columnas = tipo === "productos" ? ["name", "description", "price"] : ["customer", "total"];
  const nombres: Record<string, string> = { name: "Producto", description: "Descripción", price: "Precio", customer: "Cliente", total: "Total" };
  return (
    <section className="af-card">
      <div className="af-card-top"><div><h2>{titulo}</h2><p>Registros de la base de datos seleccionada</p></div><span className="af-counter">{filas.length} registros</span></div>
      {filas.length === 0 ? <div className="af-empty">Todavía no hay registros en esta base de datos.</div> :
        <div className="af-table-scroll"><table className="af-table"><thead><tr>{columnas.map(c => <th key={c}>{nombres[c]}</th>)}</tr></thead>
          <tbody>{filas.map((fila, i) => <tr key={i}>{columnas.map(c => <td key={c} className={c === "price" || c === "total" ? "af-money" : ""}>{c === "price" || c === "total" ? dinero(fila[c]) : String(fila[c] ?? "—")}</td>)}</tr>)}</tbody>
        </table></div>}
    </section>
  );
}

function App() {
  const [db, setDb] = useState<"mysql" | "mongo">("mysql");
  const [data, setData] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError("");
    fetch(`http://localhost:5000/abstract-factory/?db=${db}`, { signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() as Promise<Resultado>; })
      .then(setData)
      .catch(err => { if (err.name !== "AbortError") setError("No se pudo consultar la base de datos. Verifica Flask y la conexión."); });
    return () => controller.abort();
  }, [db]);

  return <main className="af-page"><div className="af-wrap">
    <a className="back-to-menu" href="/">← Volver al menú principal</a>
    <header className="af-header"><div><span className="af-eyebrow">PATRONES CREACIONALES · ARQUITECTURA HEXAGONAL</span><h1>Abstract Factory</h1><p>Productos y pedidos desde una familia de repositorios.</p></div><span className="af-header-tag">Daniel Giraldo</span></header>
    <section className="af-picker"><div><h2>Familia de repositorios</h2><p>Selecciona qué implementación utilizará la aplicación.</p></div><div className="af-switch" role="group" aria-label="Seleccionar base de datos">
      <button type="button" className={db === "mysql" ? "active" : ""} aria-pressed={db === "mysql"} onClick={() => setDb("mysql")}>MySQL</button>
      <button type="button" className={db === "mongo" ? "active" : ""} aria-pressed={db === "mongo"} onClick={() => setDb("mongo")}>MongoDB</button>
    </div></section>
    <div className="af-status"><span className="af-dot"/>Fábrica activa: <strong>{db === "mysql" ? "MySQLFactory" : "MongoFactory"}</strong><span className="af-status-note">Dos repositorios · Una familia</span></div>
    {error && <div className="af-alert" role="alert">{error}</div>}
    {!data && !error && <div className="af-loading">Consultando registros...</div>}
    {data && <div className="af-sections"><Tabla titulo="Productos" tipo="productos" filas={data.productos}/><Tabla titulo="Pedidos" tipo="pedidos" filas={data.pedidos}/></div>}
    <footer className="af-footer">React + Flask · Abstract Factory · MySQL / MongoDB</footer>
  </div></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
