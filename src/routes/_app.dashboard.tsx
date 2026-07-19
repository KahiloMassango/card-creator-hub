import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getEstudantes, type Estudante } from "@/lib/store";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Estudantes — IMetro Cartões" }] }),
});

function StatusBadge({ status }: { status: Estudante["status"] }) {
  const map: Record<Estudante["status"], string> = {
    Matriculado: "bg-primary/10 text-primary",
    Admitido: "bg-amber-100 text-amber-800",
    Pendente: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function Dashboard() {
  const [list, setList] = useState<Estudante[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { setList(getEstudantes()); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((e) =>
      [e.nome, e.email, e.bi, String(e.codigo), e.curso].some((v) => v.toLowerCase().includes(s))
    );
  }, [q, list]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estudantes</h1>
          <p className="text-sm text-muted-foreground mt-1">Consulte a lista de estudantes e emita cartões de identificação.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
            <div className="text-muted-foreground text-xs">Total</div>
            <div className="font-semibold text-lg">{list.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
            <div className="text-muted-foreground text-xs">Matriculados</div>
            <div className="font-semibold text-lg">{list.filter(e => e.status === "Matriculado").length}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Lista de estudantes</h2>
            <p className="text-xs text-muted-foreground">Selecione um estudante para gerar o respectivo cartão.</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar por nome, BI, código, curso..."
            className="h-9 w-full sm:w-72 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Estudante</th>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Ano lectivo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id_est} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                        {e.nome.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{e.nome}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.curso}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.codigo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.ano_letivo}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/cartao/$id"
                      params={{ id: e.id_est }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90"
                    >
                      Gerar cartão
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Sem resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
