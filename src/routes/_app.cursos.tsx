import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCursos, type Curso } from "@/lib/store";

export const Route = createFileRoute("/_app/cursos")({
  component: CursosPage,
  head: () => ({ meta: [{ title: "Cursos — iMetro" }] }),
});

function CursosPage() {
  const [list, setList] = useState<Curso[]>([]);
  useEffect(() => { setList(getCursos()); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cursos</h1>
        <p className="text-sm text-muted-foreground mt-1">Oferta formativa do Instituto Metropolitano.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.grau}</div>
                <div className="mt-1 font-semibold text-base leading-tight">{c.nome}</div>
              </div>
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{c.duracao}</span>
            </div>
            <div className="mt-4 text-sm space-y-1">
              <div className="text-muted-foreground text-xs">Coordenador</div>
              <div className="font-medium">{c.coordenador}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estudantes</span>
              <span className="font-semibold">{c.estudantes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
