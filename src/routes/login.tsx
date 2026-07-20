import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — IMETRO Cartões" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("arturpaulo929@gmail.com");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (login(email, senha)) {
      nav({ to: "/dashboard" });
    } else {
      setErr("Credenciais inválidas. Verifique o utilizador e a palavra-passe.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF7FD] p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 flex flex-col">
        {/* IMETRO Logo Section */}
        <div className="flex flex-col items-center mb-6 gap-2">
          <img
            src="/logo.png"
            alt="IMETRO"
            className="h-20 object-contain"
          />
          <div className="text-[10px] font-bold text-[#2E52C7] font-serif italic tracking-wider">
            A Marca da Educação
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              placeholder="Utilizador"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3E72D7] focus:ring-1 focus:ring-[#3E72D7] transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Palavra-passe"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3E72D7] focus:ring-1 focus:ring-[#3E72D7] transition-all"
            />
          </div>

          {err && <div className="text-xs text-red-500 font-medium text-center">{err}</div>}

          <button
            type="submit"
            className="w-full h-12 rounded-md bg-[#3E72D7] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#3261BE] active:bg-[#2A51A1] shadow-sm transition-all cursor-pointer"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-1.5 text-[11px] text-slate-400 text-center">
          <div>IMETRO · Portal de Emissão de Cartões</div>
          <div className="opacity-80">
            Use <span className="font-medium text-slate-500">arturpaulo929@gmail.com</span> e qualquer passe com 4+ caracteres.
          </div>
        </div>
      </div>
    </div>
  );
}
