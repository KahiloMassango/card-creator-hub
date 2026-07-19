import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getPessoas, type Pessoa } from "@/lib/store";

export const Route = createFileRoute("/_app/gerar")({
  component: GerarPage,
  head: () => ({ meta: [{ title: "Gerar Cartão — iMetro" }] }),
});

function GerarPage() {
  const nav = useNavigate();
  const [list, setList] = useState<Pessoa[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { setList(getPessoas()); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((p) => [p.nome, p.email, String(p.codigo), p.cargo, p.tipo].some((v) => v.toLowerCase().includes(s)));
  }, [list, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gerar Cartão</h1>
        <p className="text-sm text-muted-foreground mt-1">Seleccione uma pessoa para emitir e pré-visualizar o cartão de identificação.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar pessoa por nome, código ou tipo…"
          className="h-11 w-full px-4 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />

        <ul className="mt-4 divide-y divide-border">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                {p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.nome}</div>
                <div className="text-xs text-muted-foreground truncate">{p.tipo} · {p.cargo}</div>
              </div>
              <div className="text-xs font-mono text-muted-foreground hidden sm:block">{p.codigo}</div>
              <button
                onClick={() => nav({ to: "/cartao/$id", params: { id: p.id } })}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Gerar
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">Sem resultados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
