import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { addPessoa, getPessoas, type Pessoa, type TipoPessoa } from "@/lib/store";

export const Route = createFileRoute("/_app/pessoas")({
  component: PessoasPage,
  head: () => ({ meta: [{ title: "Pessoas — iMetro" }] }),
});

const tabs: (TipoPessoa | "Todos")[] = ["Todos", "Funcionário", "Docente", "Estudante"];

const pessoaSchema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto").max(100),
  tipo: z.enum(["Funcionário", "Docente", "Estudante"]),
  cargo: z.string().trim().min(2, "Indique o cargo ou curso").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  contacto: z.string().trim().min(6, "Contacto inválido").max(30),
  bi: z.string().trim().min(6, "BI inválido").max(20),
  genero: z.enum(["Masculino", "Feminino"]),
  ano_letivo: z.string().trim().min(4).max(20),
  status: z.enum(["Activo", "Inactivo", "Pendente"]),
});

function PessoasPage() {
  const [list, setList] = useState<Pessoa[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Todos");
  const [openForm, setOpenForm] = useState(false);

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
          <p className="text-sm text-muted-foreground mt-1">Funcionários, docentes e estudantes registados no sistema.</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
        >
          <span className="text-lg leading-none">+</span> Adicionar pessoa
        </button>
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

      {openForm && (
        <AddPessoaModal
          onClose={() => setOpenForm(false)}
          onCreated={(p) => { setList((l) => [p, ...l]); setOpenForm(false); }}
        />
      )}
    </div>
  );
}

function AddPessoaModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Pessoa) => void }) {
  const [form, setForm] = useState({
    nome: "", tipo: "Estudante" as TipoPessoa, cargo: "", email: "",
    contacto: "", bi: "", genero: "Masculino" as "Masculino" | "Feminino",
    ano_letivo: "2025-2026", status: "Activo" as Pessoa["status"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = pessoaSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    const nova = addPessoa(parsed.data);
    onCreated(nova);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold">Adicionar pessoa</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Registe um funcionário, docente ou estudante.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-5 grid grid-cols-2 gap-4 text-sm">
          <Field label="Nome completo" error={errors.nome} className="col-span-2">
            <input value={form.nome} onChange={(e) => update("nome", e.target.value)} maxLength={100} className={input} />
          </Field>
          <Field label="Tipo" error={errors.tipo}>
            <select value={form.tipo} onChange={(e) => update("tipo", e.target.value as TipoPessoa)} className={input}>
              <option>Funcionário</option><option>Docente</option><option>Estudante</option>
            </select>
          </Field>
          <Field label={form.tipo === "Estudante" ? "Curso" : "Cargo"} error={errors.cargo}>
            <input value={form.cargo} onChange={(e) => update("cargo", e.target.value)} maxLength={120} className={input} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} className={input} />
          </Field>
          <Field label="Contacto" error={errors.contacto}>
            <input value={form.contacto} onChange={(e) => update("contacto", e.target.value)} maxLength={30} className={input} />
          </Field>
          <Field label="BI" error={errors.bi}>
            <input value={form.bi} onChange={(e) => update("bi", e.target.value)} maxLength={20} className={input} />
          </Field>
          <Field label="Género">
            <select value={form.genero} onChange={(e) => update("genero", e.target.value as "Masculino" | "Feminino")} className={input}>
              <option>Masculino</option><option>Feminino</option>
            </select>
          </Field>
          <Field label="Ano lectivo">
            <input value={form.ano_letivo} onChange={(e) => update("ano_letivo", e.target.value)} maxLength={20} className={input} />
          </Field>
          <Field label="Estado">
            <select value={form.status} onChange={(e) => update("status", e.target.value as Pessoa["status"])} className={input}>
              <option>Activo</option><option>Pendente</option><option>Inactivo</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm hover:bg-muted">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const input = "h-9 w-full px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40";

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
    </label>
  );
}
