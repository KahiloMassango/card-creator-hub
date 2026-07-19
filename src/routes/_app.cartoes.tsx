import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCartoesEmitidos, type CartaoEmitido } from "@/lib/store";
import { EstadoBadge } from "./_app.dashboard";

export const Route = createFileRoute("/_app/cartoes")({
  component: CartoesPage,
  head: () => ({ meta: [{ title: "Cartões Emitidos — iMetro" }] }),
});

function CartoesPage() {
  const [list, setList] = useState<CartaoEmitido[]>([]);
  useEffect(() => { setList(getCartoesEmitidos()); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cartões Emitidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Histórico completo de cartões de identificação emitidos.</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
              <th className="px-5 py-3 font-medium">Titular</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Código do Cartão</th>
              <th className="px-5 py-3 font-medium">Emitido</th>
              <th className="px-5 py-3 font-medium">Validade</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acções</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
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
                <td className="px-5 py-3 text-muted-foreground">{new Date(c.emitido_em).toLocaleDateString("pt-PT")}</td>
                <td className="px-5 py-3 text-muted-foreground">{new Date(c.validade).toLocaleDateString("pt-PT")}</td>
                <td className="px-5 py-3"><EstadoBadge estado={c.estado} /></td>
                <td className="px-5 py-3 text-right">
                  <Link to="/cartao/$id" params={{ id: c.pessoa_id }} className="text-primary text-sm font-medium hover:underline">Abrir →</Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">Sem cartões emitidos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
