import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUtilizadores, type Utilizador } from "@/lib/store";

export const Route = createFileRoute("/_app/utilizadores")({
  component: UtilizadoresPage,
  head: () => ({ meta: [{ title: "Utilizadores — iMetro" }] }),
});

function UtilizadoresPage() {
  const [list, setList] = useState<Utilizador[]>([]);
  useEffect(() => { setList(getUtilizadores()); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilizadores</h1>
        <p className="text-sm text-muted-foreground mt-1">Contas com acesso ao sistema de cartões.</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
              <th className="px-4 py-3 font-medium">Utilizador</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Último acesso</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                      {u.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{u.nome}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.perfil}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.ultimo_acesso).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.activo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{u.activo ? "Activo" : "Inactivo"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
