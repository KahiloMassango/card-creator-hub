import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getCartoesEmitidos, getPessoas, type CartaoEmitido, type Pessoa } from "@/lib/store";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — iMetro Cartões" }] }),
});

function Dashboard() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [cartoes, setCartoes] = useState<CartaoEmitido[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setPessoas(getPessoas());
    setCartoes(getCartoesEmitidos());
  }, []);

  const counts = useMemo(() => ({
    cartoes: cartoes.length,
    funcionarios: pessoas.filter((p) => p.tipo === "Funcionário").length,
    docentes: pessoas.filter((p) => p.tipo === "Docente").length,
    estudantes: pessoas.filter((p) => p.tipo === "Estudante").length,
  }), [pessoas, cartoes]);

  const filteredCartoes = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cartoes;
    return cartoes.filter((c) => [c.titular, c.codigo_cartao, c.tipo].some((v) => v.toLowerCase().includes(s)));
  }, [cartoes, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por nome, código ou tipo…"
            className="h-11 w-full px-4 rounded-full border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/40 shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cartões Emitidos" value={counts.cartoes} icon={<ListIcon />} />
        <StatCard label="Funcionários" value={counts.funcionarios} icon={<UsersIcon />} />
        <StatCard label="Docentes" value={counts.docentes} icon={<BookIcon />} />
        <StatCard label="Estudantes" value={counts.estudantes} icon={<UserIcon />} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Cartões Recentes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Histórico das últimas emissões de cartões de identificação.</p>
          </div>
          <Link to="/cartoes" className="text-sm font-semibold text-primary hover:underline">Ver Todos Os Cartões</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Titular</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Código do Cartão</th>
                <th className="px-5 py-3 font-medium">Validade</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filteredCartoes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                        {c.titular.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{c.titular}</div>
                        <div className="text-xs text-muted-foreground">{c.subtitulo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.tipo}</td>
                  <td className="px-5 py-3 font-mono text-xs">{c.codigo_cartao}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(c.validade)}</td>
                  <td className="px-5 py-3"><EstadoBadge estado={c.estado} /></td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to="/cartao/$id"
                      params={{ id: c.pessoa_id }}
                      className="inline-grid place-items-center h-8 w-8 rounded-md border border-border hover:bg-accent text-muted-foreground"
                      aria-label="Ver cartão"
                    >
                      <EyeIcon />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredCartoes.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">Sem cartões emitidos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: "Emitido" | "Revogado" | "Expirado" }) {
  const map = {
    Emitido: "bg-primary text-primary-foreground",
    Revogado: "bg-red-100 text-red-700",
    Expirado: "bg-muted text-muted-foreground",
  } as const;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[estado]}`}>{estado}</span>;
}

function formatDate(iso: string) { try { return new Date(iso).toLocaleDateString("pt-PT"); } catch { return iso; } }

function EyeIcon() { return (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>); }
function UsersIcon() { return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>); }
function BookIcon() { return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>); }
function UserIcon() { return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>); }
function ListIcon() { return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/></svg>); }
