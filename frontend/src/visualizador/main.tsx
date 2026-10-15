import { StrictMode, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { initialProduct, makeSimulation, names, type Database, type DiagramNode, type Pattern } from './simulations';
import './styles.css';

const duration = 2600;
const emptyPlayback = { index: 0, progress: 0, playing: false };

function route(from: DiagramNode, to: DiagramNode) {
  if (from.id === to.id) {
    const x = from.x + 70, y = from.y - 34;
    return { a: [x, y], b: [x + 65, y - 65], c: [x - 90, y - 65], d: [x - 50, y] };
  }
  const dx = to.x - from.x, dy = to.y - from.y;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const a = [from.x + (horizontal ? Math.sign(dx) * 123 : 0), from.y + (horizontal ? 0 : Math.sign(dy) * 34)];
  const d = [to.x - (horizontal ? Math.sign(dx) * 123 : 0), to.y - (horizontal ? 0 : Math.sign(dy) * 34)];
  const b = horizontal ? [(a[0] + d[0]) / 2, a[1]] : [a[0], (a[1] + d[1]) / 2];
  const c = horizontal ? [(a[0] + d[0]) / 2, d[1]] : [d[0], (a[1] + d[1]) / 2];
  return { a, b, c, d };
}
function path(r: ReturnType<typeof route>) { return `M ${r.a} C ${r.b} ${r.c} ${r.d}`; }
function point(r: ReturnType<typeof route>, t: number) {
  return [0, 1].map(i => (1 - t) ** 3 * r.a[i] + 3 * (1 - t) ** 2 * t * r.b[i] + 3 * (1 - t) * t ** 2 * r.c[i] + t ** 3 * r.d[i]);
}

function Visualizer() {
  const [pattern, setPattern] = useState<Pattern>('builder');
  const [db, setDb] = useState<Database>('mysql');
  const [failed, setFailed] = useState(false);
  const [sample, setSample] = useState(initialProduct);
  const [playback, setPlayback] = useState(emptyPlayback);
  const [speed, setSpeed] = useState(1);
  const [inspected, setInspected] = useState<string | null>(null);
  const simulation = useMemo(() => makeSimulation(pattern, db, sample, failed), [pattern, db, sample, failed]);
  const { index, progress, playing } = playback;
  const step = simulation.steps[index];
  const last = simulation.steps.length - 1;
  const finished = index === last && progress === 1;
  const visited = simulation.steps.slice(0, index + 1);
  const byId = Object.fromEntries(simulation.nodes.map(n => [n.id, n]));
  const activeRoute = route(byId[step.from], byId[step.to]);
  const uniqueEdges = [...new Map(simulation.steps.filter(s => s.from !== s.to).map(s => [`${s.from}-${s.to}`, s])).values()];
  const currentFields = [...visited].reverse().find(s => s.fields)?.fields;
  const productCreated = visited.some(s => s.to === 'product');
  const selectedContract = simulation.nodes.find(n => n.id === inspected);

  useEffect(() => {
    if (!playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) * speed / duration;
      previous = now;
      setPlayback(current => {
        if (!current.playing) return current;
        const next = current.progress + delta;
        if (next < 1) return { ...current, progress: next };
        if (current.index === last) return { index: last, progress: 1, playing: false };
        return { ...current, index: current.index + 1, progress: 0 };
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, last]);

  function reset() { setPlayback(emptyPlayback); setInspected(null); }
  function goTo(next: number) { setPlayback({ index: Math.max(0, Math.min(last, next)), progress: 0, playing: false }); setInspected(null); }
  function chooseNode(id: string) {
    const first = simulation.steps.findIndex(s => s.to === id);
    if (first >= 0) goTo(first);
    else { setInspected(id); setPlayback(current => ({ ...current, playing: false })); }
  }
  function applySample(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSample({ name: String(form.get('name')).trim(), price: Number(form.get('price')), description: String(form.get('description')) });
    reset();
  }

  return <main className="viz-page">
    <nav className="viz-nav" aria-label="Navegación principal"><a href="/">← Volver al menú</a><span>REACT + FLASK <span className="nav-divider">/</span> ARQUITECTURA HEXAGONAL</span><span className="local-badge"><i /> Simulación local</span></nav>
    <header className="viz-header"><div><p className="eyebrow">LABORATORIO INTERACTIVO <span>01 — CREACIÓN DE OBJETOS</span></p><h1>El código, <span>en movimiento.</span></h1><p>Explora qué ocurre dentro de cada patrón. Detén el recorrido y observa cada llamada.</p></div><div className="header-mark" aria-hidden="true">{'{'}<span>→</span>{'}'}</div></header>

    <section className="pattern-picker" aria-label="Configuración de la simulación">
      <div className="pattern-tabs" role="group" aria-label="Seleccionar patrón">{(Object.keys(names) as Pattern[]).map((id, i) => <button key={id} aria-pressed={id === pattern} className={id === pattern ? 'selected' : ''} onClick={() => { setPattern(id); reset(); }}><span>0{i + 1}</span>{names[id]}</button>)}</div>
      {pattern === 'abstract' ? <label className="inline-label">Familia <select value={db} onChange={e => { setDb(e.target.value as Database); reset(); }}><option value="mysql">MySQL</option><option value="mongo">MongoDB</option></select></label> : pattern === 'builder' ? <label className="inline-label">Escenario <select value={failed ? 'error' : 'valid'} onChange={e => { setFailed(e.target.value === 'error'); reset(); }}><option value="valid">Validación correcta</option><option value="error">Precio negativo · error</option></select></label> : <span className="config-note">MongoDB · configurado en el controlador</span>}
    </section>

    <div className="simulation-intro"><div><h2>{names[pattern]}</h2><p>{simulation.description}</p></div><span className="step-counter">{String(index + 1).padStart(2, '0')} <span>/ {simulation.steps.length} pasos</span></span></div>

    {pattern === 'builder' && <details className="sample-editor"><summary>Datos de entrada <span>{sample.name} · ${failed ? '-1' : sample.price.toLocaleString('es-CO')} · editar ejemplo</span></summary><form onSubmit={applySample}><label>Nombre<input name="name" defaultValue={sample.name} required pattern=".*\S.*" maxLength={60} /></label><label>Precio<input name="price" type="number" defaultValue={sample.price} min="0" step="any" required /></label><label>Descripción<input name="description" defaultValue={sample.description} maxLength={120} /></label><button type="submit">Aplicar datos y reiniciar</button></form><p>El escenario de error reemplaza el precio por −1 para ilustrar la validación real del backend.</p></details>}

    <div className="workspace">
      <section className={`diagram-panel ${step.error ? 'has-error' : ''}`} aria-labelledby="diagram-heading">
        <div className="panel-heading"><h3 id="diagram-heading"><span className="status-light" /> Recorrido de ejecución</h3><span>{finished ? 'Finalizado' : playing ? 'Reproduciendo' : 'En pausa'}</span></div>
        <div className="diagram-scroll"><div className="diagram-canvas">
          <svg viewBox="0 0 920 540" className="connections" aria-hidden="true">
            <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker><filter id="glow"><feGaussianBlur stdDeviation="4" /></filter></defs>
            {uniqueEdges.map(s => <path key={`${s.from}-${s.to}`} d={path(route(byId[s.from], byId[s.to]))} className="edge" markerEnd="url(#arrow)" />)}
            {simulation.relations.map(r => <g key={`${r.from}-${r.to}`}><path d={path(route(byId[r.from], byId[r.to]))} className="structural-edge" /><text x={(byId[r.from].x + byId[r.to].x) / 2} y={(byId[r.from].y + byId[r.to].y) / 2 - 7} className="relation-label">{r.label}</text></g>)}
            <g className={step.error ? 'active-flow error-flow' : step.returns ? 'active-flow return-flow' : 'active-flow'}><path d={path(activeRoute)} markerEnd="url(#arrow)" />
              <g className="data-packet">{[0.08, 0.04, 0].map((lag, i) => { const p = point(activeRoute, Math.max(0, progress - lag)); return <circle key={lag} cx={p[0]} cy={p[1]} r={i === 2 ? 5 : 3} opacity={(i + 1) / 3} />; })}<circle cx={point(activeRoute, progress)[0]} cy={point(activeRoute, progress)[1]} r="11" opacity=".6" filter="url(#glow)" /></g>
            </g>
          </svg>
          {simulation.nodes.map(n => {
            const created = !n.object || visited.some(s => s.to === n.id);
            const isContract = n.id.toLowerCase().includes('contract');
            return <button key={n.id} style={{ left: `${n.x / 9.2}%`, top: `${n.y / 5.4}%` }} className={`diagram-node ${step.to === n.id ? 'active' : ''} ${step.from === n.id ? 'source' : ''} ${n.object ? 'object-node' : ''} ${created ? 'created' : 'pending'} ${isContract ? 'contract-node' : ''} ${inspected === n.id ? 'inspected' : ''}`} aria-label={`${n.label}: ${created ? n.detail : 'objeto aún no creado'}. ${isContract ? 'Ver contrato' : 'Ir al primer paso de este componente'}`} onClick={() => chooseNode(n.id)}><span className="node-kind">{isContract ? '«abstract»' : n.object ? created ? '● instancia creada' : '○ por crear' : n.id === 'react' ? 'frontend' : n.id.toLowerCase().includes('db') ? 'datos' : 'componente'}</span><strong>{n.label}</strong><small>{n.detail}</small></button>;
          })}
        </div></div>
        <div className="diagram-legend"><span><i className="legend-line" /> Llamada / creación</span><span><i className="legend-line return" /> Retorno</span><span><i className="legend-line structural" /> Relación estructural</span><span>Selecciona un nodo para explorarlo</span></div>
        {pattern === 'builder' && <div className={`product-draft ${productCreated ? 'is-built' : ''}`}><div><span className="eyebrow">{productCreated ? 'OBJETO PRODUCT CREADO' : 'BORRADOR DEL BUILDER'}</span><strong>{productCreated ? 'Product' : 'ProductBuilder → Product'}</strong><small>{productCreated ? 'Instancia inmutable · frozen=True' : 'Los atributos se preparan antes de crear Product.'}</small></div><div className="draft-fields">{['_name', '_price', '_description'].map(field => <div key={field} className={currentFields?.[field] !== null && currentFields?.[field] !== undefined && (field !== '_description' || index >= 6) ? 'filled' : ''}><code>{productCreated ? field.slice(1) : field}</code><span>{currentFields && currentFields[field] !== null && currentFields[field] !== undefined ? JSON.stringify(currentFields[field]) : '—'}</span></div>)}</div></div>}
      </section>

      <aside className="inspector" aria-label="Detalle de la operación">
        <div className="panel-heading"><h3>{selectedContract ? 'Contrato seleccionado' : 'Dentro de este paso'}</h3><span className="code-icon" aria-hidden="true">{'</>'}</span></div>
        <div className="inspector-content" aria-live="polite" aria-atomic="true">
          <span className={`operation-badge ${step.error && !selectedContract ? 'error' : ''}`}>{selectedContract ? 'RELACIÓN ESTRUCTURAL' : step.error ? 'VALIDACIÓN FALLIDA' : step.returns ? 'RETORNO DE DATOS' : 'EJECUCIÓN'}</span>
          <h3>{selectedContract ? selectedContract.label : step.title}</h3><p className="operation-explanation">{selectedContract ? 'Este contrato abstracto define los métodos de sus implementaciones. La herencia no constituye una llamada HTTP ni un paso adicional de ejecución.' : step.explanation}</p>
          <dl><dt>Clase / componente</dt><dd>{selectedContract ? selectedContract.label : step.owner}</dd><dt>Método</dt><dd><code>{selectedContract ? selectedContract.id === 'factoryContract' ? 'productos() · pedidos()' : selectedContract.id === 'repoContract' ? 'listar()' : 'crear_repositorio() · listar_productos()' : step.method}</code></dd></dl>
          {selectedContract ? <div className="contract-note">Las conexiones discontinuas muestran la estructura. Las conexiones luminosas muestran llamadas en tiempo de ejecución.<button onClick={() => setInspected(null)}>Volver al paso actual</button></div> : <><div className="code-heading"><span>CÓDIGO DEL PROYECTO</span><span>Python / TSX</span></div><pre className="source-code"><code>{step.code}</code></pre><p className="source-path">{step.file}</p><div className="code-heading"><span>ESTADO DE LOS DATOS</span><span>Ejemplo local</span></div><pre className={`data-state ${step.error ? 'error-data' : ''}`}><code>{JSON.stringify(step.data, null, 2)}</code></pre></>}
        </div>
      </aside>
    </div>

    <section className="playback-panel" aria-label="Controles de reproducción">
      <div className="playback-top"><div className="transport"><button className="play-button" onClick={() => { setInspected(null); setPlayback(current => ({ ...current, ...(finished ? { index: 0, progress: 0 } : {}), playing: !current.playing })); }}><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{playing ? 'Pausar' : finished ? 'Reproducir de nuevo' : 'Reproducir'}</button><button onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Paso anterior" title="Paso anterior">←</button><button onClick={() => goTo(index + 1)} disabled={index === last} aria-label="Paso siguiente" title="Paso siguiente">→</button><button onClick={reset} aria-label="Reiniciar simulación" title="Reiniciar simulación">↺</button></div><label className="inline-label">Velocidad<select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option></select></label><span className="playback-caption" role="status">{finished ? 'Recorrido completado' : `Paso ${index + 1} de ${simulation.steps.length}`} · {step.title}</span></div>
      <label className="timeline-label">Ir a un paso<input aria-label="Seleccionar paso de la simulación" type="range" min="0" max={last} value={index} style={{ '--complete': `${index / last * 100}%` } as CSSProperties} onChange={e => goTo(Number(e.target.value))} /></label>
      <div className="step-list" aria-label="Pasos de la simulación">{simulation.steps.map((s, i) => <button key={`${pattern}-${i}`} aria-current={index === i ? 'step' : undefined} className={`${i === index ? 'current' : ''} ${i < index ? 'completed' : ''}`} onClick={() => goTo(i)}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</button>)}</div>
    </section>
    <footer className="viz-footer"><span>Datos ilustrativos · Sin peticiones HTTP ni cambios en las bases de datos</span><span>Builder / Factory Method / Abstract Factory</span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Visualizer /></StrictMode>);
