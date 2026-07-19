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
    else { setSession(s); setReady(true); }
  }, [nav]);

  if (!ready) return null;

  const nav_items = [
    { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { to: "/pessoas", label: "Pessoas", icon: UsersIcon },
    { to: "/gerar", label: "Gerar Cartão", icon: CardIcon },
    { to: "/cartoes", label: "Cartões Emitidos", icon: ListIcon },
    { to: "/cursos", label: "Cursos", icon: BookIcon },
    { to: "/utilizadores", label: "Utilizadores", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar no-print">
        <div className="h-20 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="h-11 w-11 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-lg">iM</div>
          <div>
            <div className="text-base font-semibold leading-tight">iMetro</div>
            <div className="text-[10px] tracking-widest text-muted-foreground uppercase">Cartões & Identificação</div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {nav_items.map((n) => {
            const active = location.pathname === n.to || location.pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
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
            className="w-full text-sm px-3 py-2 rounded-md bg-sidebar-accent/60 hover:bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            Terminar Sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-4 md:px-8 no-print">
          <div className="text-sm text-muted-foreground">Bem-vindo, <span className="text-foreground font-medium">{session?.nome}</span></div>
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
              {session?.nome?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;
const sv = (props: IconProps) => ({
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...props,
});

function DashboardIcon(p: IconProps) { return (<svg {...sv(p)}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>); }
function UsersIcon(p: IconProps) { return (<svg {...sv(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function CardIcon(p: IconProps) { return (<svg {...sv(p)}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>); }
function ListIcon(p: IconProps) { return (<svg {...sv(p)}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/></svg>); }
function BookIcon(p: IconProps) { return (<svg {...sv(p)}><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>); }
function UserIcon(p: IconProps) { return (<svg {...sv(p)}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>); }
