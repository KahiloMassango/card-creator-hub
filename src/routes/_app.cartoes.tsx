import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getEstudantes, type Estudante } from "@/lib/store";

export const Route = createFileRoute("/_app/cartoes")({
  component: CartoesPage,
  head: () => ({ meta: [{ title: "Cartões emitidos — IMetro" }] }),
});

function CartoesPage() {
  const [list, setList] = useState<Estudante[]>([]);
  useEffect(() => { setList(getEstudantes().filter(e => e.status === "Matriculado")); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cartões emitidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Cartões disponíveis para pré-visualização, impressão ou exportação em PDF.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <Link
            key={e.id_est}
            to="/cartao/$id"
            params={{ id: e.id_est }}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                {e.nome.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{e.nome}</div>
                <div className="text-xs text-muted-foreground truncate">{e.curso}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{e.codigo}</span>
              <span className="text-primary group-hover:underline">Abrir cartão →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
