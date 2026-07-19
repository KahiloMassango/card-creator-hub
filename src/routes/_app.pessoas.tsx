import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getPessoas, type Pessoa, type TipoPessoa } from "@/lib/store";

export const Route = createFileRoute("/_app/pessoas")({
  component: PessoasPage,
  head: () => ({ meta: [{ title: "Pessoas — iMetro" }] }),
});

const tabs: (TipoPessoa | "Todos")[] = ["Todos", "Funcionário", "Docente", "Estudante"];

function PessoasPage() {
  const [list, setList] = useState<Pessoa[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Todos");

  useEffect(() => { setList(getPessoas()); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return list.filter((p) => {
      if (tab !== "Todos" && p.tipo !== tab) return false;
      if (!s) return true;
      return [p.nome, p.email, p.bi, String(p.codigo), p.cargo].some((v) => v.toLowerCase().includes(s));
    });
  }, [list, q, tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
        <p className="text-sm text-muted-foreground mt-1">Funcionários, docentes e estudantes registados no sistema.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-md bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar…"
            className="h-9 w-full sm:w-72 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cargo / Curso</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                        {p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{p.nome}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.tipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.cargo}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "Activo" ? "bg-primary/10 text-primary" :
                      p.status === "Pendente" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/cartao/$id"
                      params={{ id: p.id }}
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
