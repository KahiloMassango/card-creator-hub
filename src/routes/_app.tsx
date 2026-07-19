import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession, logout } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<{ nome: string; email: string } | null>(null);
  const { location } = useRouterState();

  useEffect(() => {
    const s = getSession();
    if (!s) nav({ to: "/login" });
    else {
      setSession(s);
      setReady(true);
    }
  }, [nav]);

  if (!ready) return null;

  const nav_items = [
    { to: "/dashboard", label: "Estudantes", icon: UsersIcon },
    { to: "/cartoes", label: "Cartões emitidos", icon: CardIcon },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar no-print">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">iM</div>
          <div>
            <div className="text-sm font-semibold leading-tight">IMetro</div>
            <div className="text-[11px] text-muted-foreground">Sistema de Cartões</div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {nav_items.map((n) => {
            const active = location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-sidebar-accent/60 text-sidebar-foreground"
          >
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-4 md:px-8 no-print">
          <div className="text-sm text-muted-foreground">Bem-vindo, <span className="text-foreground font-medium">{session?.nome}</span></div>
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
            {session?.nome?.slice(0, 2).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function CardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>
    </svg>
  );
}
