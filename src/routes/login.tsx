import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — IMetro Cartões" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("arturpaulo929@gmail.com");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (login(email, senha)) nav({ to: "/dashboard" });
    else setErr("Credenciais inválidas. Verifique o email e a palavra-passe.");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary-foreground/15 grid place-items-center font-bold">iM</div>
          <div>
            <div className="text-lg font-semibold tracking-tight">IMetro</div>
            <div className="text-xs opacity-80">Sistema de Cartões</div>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Emissão de cartões de identificação institucional</h1>
          <p className="mt-4 text-sm opacity-85 max-w-md">
            Uma ferramenta simples para gerar, imprimir e gerir cartões de estudantes, com verificação por código QR.
          </p>
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} IMetro · Uso institucional</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">iM</div>
            <div className="font-semibold">IMetro Cartões</div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
          <p className="text-sm text-muted-foreground mt-1">Aceda à sua conta para gerir cartões.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Palavra-passe</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            {err && <div className="text-sm text-destructive">{err}</div>}
            <button
              type="submit"
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            >
              Entrar
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Demonstração: use o email pré-preenchido e qualquer palavra-passe com 4+ caracteres.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
