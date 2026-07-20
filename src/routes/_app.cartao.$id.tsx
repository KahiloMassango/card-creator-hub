import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { emitirCartao, getEstudante, getPessoa, type Estudante, type Pessoa } from "@/lib/store";
import { CartaoFrente, CartaoVerso, drawCardFrenteCanvas, drawCardVersoCanvas } from "@/components/CartaoEstudante";

export const Route = createFileRoute("/_app/cartao/$id")({
  component: CartaoPage,
  head: () => ({ meta: [{ title: "Cartão — iMetro" }] }),
});

function pessoaToEstudante(p: Pessoa): Estudante {
  return {
    id_est: p.id, nome: p.nome, contacto: p.contacto, genero: p.genero,
    email: p.email, bi: p.bi, codigo: p.codigo, curso: p.cargo,
    ano_letivo: p.ano_letivo, status: p.status === "Activo" ? "Matriculado" : p.status === "Pendente" ? "Pendente" : "Admitido",
    foto: p.foto, tema: p.tema,
  };
}

function CartaoPage() {
  const { id } = useParams({ from: "/_app/cartao/$id" });
  const [e, setE] = useState<Estudante | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = getPessoa(id);
    if (p) {
      setE(pessoaToEstudante(p));
      emitirCartao(p);
      return;
    }
    const est = getEstudante(id);
    if (est) {
      setE(est);
      emitirCartao({
        id: est.id_est, nome: est.nome, tipo: "Estudante", cargo: est.curso, email: est.email,
        contacto: est.contacto, bi: est.bi, codigo: est.codigo, genero: est.genero,
        ano_letivo: est.ano_letivo, status: est.status === "Matriculado" ? "Activo" : est.status === "Pendente" ? "Pendente" : "Inactivo",
        foto: est.foto, tema: est.tema,
      });
    }
  }, [id]);

  async function exportPDF() {
    if (!e) return;
    setBusy(true);
    try {
      // A4 portrait, mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const cardW = 85.6, cardH = 53.98;
      const scale = 6; // px per mm for canvas rendering
      const canvas = document.createElement("canvas");
      canvas.width = cardW * scale; canvas.height = cardH * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale / (342 / cardW), scale / (342 / cardW));
      // draw front
      await drawCardFrenteCanvas(ctx, e, 0, 0, 342, 216);
      const frontUrl = canvas.toDataURL("image/png");
      // clear + back
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale / (342 / cardW), scale / (342 / cardW));
      await drawCardVersoCanvas(ctx, e, 0, 0, 342, 216);
      const backUrl = canvas.toDataURL("image/png");

      // layout: title + front + back on same page (portrait)
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(14);
      pdf.text("Instituto Metropolitano — Cartão de Estudante", 20, 20);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(90);
      pdf.text(`${e.nome} · Código ${e.codigo} · ${e.curso}`, 20, 27);
      pdf.setTextColor(0);

      const x = (210 - cardW) / 2;
      pdf.setFontSize(9); pdf.setTextColor(120);
      pdf.text("FRENTE", x, 40); 
      pdf.addImage(frontUrl, "PNG", x, 43, cardW, cardH);
      pdf.text("VERSO", x, 43 + cardH + 10);
      pdf.addImage(backUrl, "PNG", x, 43 + cardH + 13, cardW, cardH);

      pdf.setFontSize(8);
      pdf.text(`Documento gerado em ${new Date().toLocaleString("pt-PT")}`, 20, 285);
      pdf.text("Documento de exemplo — Sistema de Cartões IMetro", 20, 290);

      pdf.save(`cartao-${e.codigo}-${e.nome.replace(/\s+/g, "-")}.pdf`);
    } finally { setBusy(false); }
  }

  if (!e) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Pessoa não encontrada.</p>
        <Link to="/dashboard" className="text-sm text-primary hover:underline mt-3 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 no-print">
        <div>
          <div className="text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:underline">Estudantes</Link> / Cartão
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{e.nome}</h1>
          <p className="text-sm text-muted-foreground">{e.curso} · {e.ano_letivo}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent"
          >
            Imprimir
          </button>
          <button
            onClick={exportPDF}
            disabled={busy}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "A gerar…" : "Exportar PDF"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid gap-8 sm:grid-cols-2 justify-items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Frente</div>
            <CartaoFrente e={e} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Verso</div>
            <CartaoVerso e={e} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 no-print">
        <h3 className="font-semibold">Dados do titular</h3>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row k="Nome completo" v={e.nome} />
          <Row k="Bilhete de Identidade" v={e.bi} />
          <Row k="Email" v={e.email} />
          <Row k="Contacto" v={e.contacto} />
          <Row k="Género" v={e.genero} />
          <Row k="Código de estudante" v={String(e.codigo)} />
          <Row k="Curso" v={e.curso} />
          <Row k="Ano lectivo" v={e.ano_letivo} />
          <Row k="Estado" v={e.status} />
          <Row k="ID interno" v={e.id_est} />
        </dl>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
