import type { ReactNode } from "react";

export default function PatternPage({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <nav aria-label="Navegación de patrones">
        <a className="back-to-menu" href="/index.html">← Volver al menú principal</a>
      </nav>
      {children}
    </main>
  );
}
