import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addPessoa,
  emitirCartao,
  getCursos,
  getPessoas,
  updatePessoa,
  type Pessoa,
  type TipoPessoa,
} from "@/lib/store";
import {
  CartaoFrente,
  CartaoVerso,
  drawCardFrenteCanvas,
  drawCardVersoCanvas,
} from "@/components/CartaoEstudante";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/_app/gerar")({
  component: GerarPage,
  head: () => ({ meta: [{ title: "Card Studio — IMETRO" }] }),
});

function GerarPage() {
  const nav = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [selectedPessoaId, setSelectedPessoaId] = useState<string>("avulso");
  
  // Webcam & Photo States
  const [foto, setFoto] = useState<string>("");
  const [tema, setTema] = useState<string>("azul");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Standalone/Avulso Card Form State
  const [form, setForm] = useState({
    nome: "",
    tipo: "Estudante" as TipoPessoa,
    cargo: "",
    email: "",
    contacto: "",
    bi: "",
    codigo: "",
    genero: "Masculino" as "Masculino" | "Feminino",
    ano_letivo: "2025-2026",
    guardarPessoa: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPessoas(getPessoas());
  }, []);

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Selected person object
  const selectedPessoa = useMemo(() => {
    if (selectedPessoaId === "avulso") return null;
    return pessoas.find((p) => p.id === selectedPessoaId) || null;
  }, [pessoas, selectedPessoaId]);

  // Load details if a registered person is selected
  useEffect(() => {
    if (selectedPessoa) {
      setFoto(selectedPessoa.foto || "");
      setTema(selectedPessoa.tema || "azul");
    } else {
      setFoto("");
      setTema("azul");
    }
  }, [selectedPessoa]);

  // Handle webcam stream start
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 375, facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Erro no acesso à câmara:", err);
      alert("Não foi possível aceder à câmara de vídeo. Verifique as permissões do browser.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 375;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 375);
        const base64 = canvas.toDataURL("image/jpeg");
        setFoto(base64);
        stopCamera();
      }
    }
  };

  // Image Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Build the dynamic estudante object for preview
  const liveEstudante = useMemo(() => {
    if (selectedPessoa) {
      return {
        id_est: selectedPessoa.id,
        nome: selectedPessoa.nome,
        contacto: selectedPessoa.contacto,
        genero: selectedPessoa.genero,
        email: selectedPessoa.email,
        bi: selectedPessoa.bi,
        codigo: selectedPessoa.codigo,
        curso: selectedPessoa.cargo,
        ano_letivo: selectedPessoa.ano_letivo,
        status:
          selectedPessoa.status === "Activo"
            ? ("Matriculado" as const)
            : ("Pendente" as const),
        foto: foto || undefined,
        tema,
      };
    }

    // Default or Avulso values
    return {
      id_est: "avulso-temp",
      nome: form.nome || "Nome do Aluno",
      contacto: form.contacto || "+244 900 000 000",
      genero: form.genero,
      email: form.email || "email@exemplo.com",
      bi: form.bi || "000000000LA000",
      codigo: Number(form.codigo) || 20260000,
      curso: form.cargo || "Curso / Direção",
      ano_letivo: form.ano_letivo,
      status: "Matriculado" as const,
      foto: foto || undefined,
      tema,
    };
  }, [selectedPessoa, form, foto, tema]);

  // Filter people for the select search
  const filteredPessoas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pessoas;
    return pessoas.filter((p) =>
      [p.nome, p.bi, String(p.codigo), p.cargo].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [pessoas, searchQuery]);

  // Submit and save card
  const handleEmit = async () => {
    setBusy(true);
    try {
      let finalPessoa: Pessoa;

      if (selectedPessoa) {
        // Update existing person
        finalPessoa = { ...selectedPessoa, foto, tema };
        updatePessoa(finalPessoa);
        emitirCartao(finalPessoa, { foto, tema });
      } else {
        // standalone/avulso card
        if (!form.nome) {
          alert("Por favor preencha o Nome do Titular");
          return;
        }

        const codigoNum = Number(form.codigo) || Math.floor(Math.random() * 10000000);
        const pData = {
          nome: form.nome,
          tipo: form.tipo,
          cargo: form.cargo || "Estudante",
          email: form.email || `${codigoNum}@imetro.ao`,
          contacto: form.contacto || "+244 900 000 000",
          bi: form.bi || "000000000LA000",
          genero: form.genero,
          ano_letivo: form.ano_letivo,
          status: "Activo" as const,
          foto,
          tema,
        };

        if (form.guardarPessoa) {
          // Register permanently
          finalPessoa = addPessoa(pData);
        } else {
          // Just mock person structure for single card generation
          finalPessoa = {
            id: `avulso-${Date.now()}`,
            codigo: codigoNum,
            ...pData,
          };
        }
        
        emitirCartao(finalPessoa, { foto, tema });
      }

      alert("Cartão emitido com sucesso e gravado no histórico.");
      // Refresh list
      setPessoas(getPessoas());
      // Navigate to printed view
      nav({ to: "/cartao/$id", params: { id: finalPessoa.id } });
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao emitir o cartão.");
    } finally {
      setBusy(false);
    }
  };

  // Export PDF directly
  async function exportPDF() {
    setBusy(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const cardW = 85.6,
        cardH = 53.98;
      const scale = 6;
      const canvas = document.createElement("canvas");
      canvas.width = cardW * scale;
      canvas.height = cardH * scale;
      const ctx = canvas.getContext("2d")!;
      
      ctx.scale(scale / (342 / cardW), scale / (342 / cardW));
      await drawCardFrenteCanvas(ctx, liveEstudante, 0, 0, 342, 216);
      const frontUrl = canvas.toDataURL("image/png");

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale / (342 / cardW), scale / (342 / cardW));
      await drawCardVersoCanvas(ctx, liveEstudante, 0, 0, 342, 216);
      const backUrl = canvas.toDataURL("image/png");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Universidade Metropolitana — Cartão de Identificação", 20, 20);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(90);
      pdf.text(`${liveEstudante.nome} · Código ${liveEstudante.codigo} · ${liveEstudante.curso}`, 20, 27);
      pdf.setTextColor(0);

      const x = (210 - cardW) / 2;
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text("FRENTE", x, 40);
      pdf.addImage(frontUrl, "PNG", x, 43, cardW, cardH);
      pdf.text("VERSO", x, 43 + cardH + 10);
      pdf.addImage(backUrl, "PNG", x, 43 + cardH + 13, cardW, cardH);

      pdf.setFontSize(8);
      pdf.text(`Documento gerado em ${new Date().toLocaleString("pt-PT")}`, 20, 285);
      pdf.text("Documento oficial — Reitoria IMETRO", 20, 290);

      pdf.save(`cartao-imetro-${liveEstudante.codigo}-${liveEstudante.nome.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f2b5c]">
          Card Studio — IMETRO
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estúdio interativo de emissão, fotografia e customização de cartões universitários.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Control Panel (Form + Customizations) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Source Section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Origem dos Dados
            </h2>
            
            <div className="flex gap-2 p-1 bg-muted rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedPessoaId("avulso")}
                className={`flex-1 py-2 rounded-md transition-all ${
                  selectedPessoaId === "avulso"
                    ? "bg-white shadow-sm text-[#0f2b5c] font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cartão Avulso / Rápido
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pessoas.length > 0) {
                    setSelectedPessoaId(pessoas[0].id);
                  } else {
                    alert("Sem pessoas registadas. Crie um cartão avulso.");
                  }
                }}
                className={`flex-1 py-2 rounded-md transition-all ${
                  selectedPessoaId !== "avulso"
                    ? "bg-white shadow-sm text-[#0f2b5c] font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pessoa Registada
              </button>
            </div>

            {selectedPessoaId !== "avulso" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  Pesquisar & Selecionar Pessoa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, código ou BI…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <select
                  value={selectedPessoaId}
                  onChange={(e) => setSelectedPessoaId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                >
                  {filteredPessoas.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.tipo}] {p.nome} — Cod: {p.codigo}
                    </option>
                  ))}
                  {filteredPessoas.length === 0 && (
                    <option value="">Sem resultados para a pesquisa</option>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Standalone Card Form Details */}
          {selectedPessoaId === "avulso" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Dados do Titular
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="col-span-2">
                  <span className="text-xs text-muted-foreground font-medium">Nome completo</span>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Manuel Domingos"
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">Tipo</span>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPessoa })}
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    <option>Estudante</option>
                    <option>Docente</option>
                    <option>Funcionário</option>
                  </select>
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">
                    {form.tipo === "Estudante" ? "Curso" : "Cargo / Função"}
                  </span>
                  {form.tipo === "Estudante" ? (
                    <select
                      value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                    >
                      <option value="">Selecione o curso…</option>
                      {getCursos().map((c) => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      placeholder="Ex: Director Académico"
                      className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  )}
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">Nº de Estudante</span>
                  <input
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ex: 20261902"
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">Nº de Bilhete (BI)</span>
                  <input
                    value={form.bi}
                    onChange={(e) => setForm({ ...form, bi: e.target.value })}
                    placeholder="Ex: 004523190LA045"
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">Contacto</span>
                  <input
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                    placeholder="Ex: +244 923 000 000"
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </label>

                <label>
                  <span className="text-xs text-muted-foreground font-medium">Ano Lectivo</span>
                  <input
                    value={form.ano_letivo}
                    onChange={(e) => setForm({ ...form, ano_letivo: e.target.value })}
                    placeholder="Ex: 2025-2026"
                    className="mt-1 h-9 w-full px-3 rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </label>

                <div className="col-span-2 pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guardar-checkbox"
                    checked={form.guardarPessoa}
                    onChange={(e) => setForm({ ...form, guardarPessoa: e.target.checked })}
                    className="h-4 w-4 text-primary border-slate-300 rounded"
                  />
                  <label htmlFor="guardar-checkbox" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
                    Guardar esta pessoa na base de dados permanente da IMETRO
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Photo & Customization Panel */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Personalização do Cartão
            </h2>

            {/* Theme selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Tema do Cartão</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTema("azul")}
                  className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                    tema === "azul"
                      ? "border-[#3E72D7] bg-[#3E72D7]/5 text-[#3E72D7]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full bg-[#0f2b5c] border border-white" />
                  Azul & Ouro
                </button>
                <button
                  type="button"
                  onClick={() => setTema("verde")}
                  className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                    tema === "verde"
                      ? "border-[#14603a] bg-[#14603a]/5 text-[#14603a]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full bg-[#0b3d1f] border border-white" />
                  Verde
                </button>
                <button
                  type="button"
                  onClick={() => setTema("preto")}
                  className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                    tema === "preto"
                      ? "border-slate-900 bg-slate-900/5 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full bg-[#18181b] border border-white" />
                  Preto Executivo
                </button>
              </div>
            </div>

            {/* Photo Capture Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 block">Fotografia do Aluno</label>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M2 12h3m14 0h3m-9-9v3m0 14v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>
                  {cameraActive ? "Desligar Câmara" : "Tirar Foto (Webcam)"}
                </button>
                
                <label className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                  <svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  Carregar Ficheiro
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto("")}
                    className="px-3 py-1.5 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                  >
                    Remover Foto
                  </button>
                )}
              </div>

              {/* Webcam stream rendering */}
              {cameraActive && (
                <div className="mt-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center p-3 gap-3">
                  <video
                    ref={videoRef}
                    className="w-full max-w-[200px] h-[250px] rounded-md object-cover bg-black"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-1.5 bg-[#3E72D7] text-white text-xs font-semibold rounded-md hover:bg-[#3261BE]"
                    >
                      Capturar Imagem
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded-md hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleEmit}
              disabled={busy}
              className="flex-1 h-11 bg-[#3E72D7] text-white rounded-lg text-sm font-semibold hover:bg-[#3261BE] disabled:opacity-60 transition cursor-pointer flex items-center justify-center"
            >
              {busy ? "A emitir…" : "Emitir & Gravar Histórico"}
            </button>
            <button
              onClick={exportPDF}
              disabled={busy}
              className="h-11 px-5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Exportar PDF
            </button>
          </div>

        </div>

        {/* Live Card Preview Column */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6 sticky top-6 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 self-start">
            Antevisão em Tempo Real
          </h2>
          
          <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Frente do Cartão
              </span>
              <CartaoFrente e={liveEstudante} />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Verso do Cartão
              </span>
              <CartaoVerso e={liveEstudante} />
            </div>
          </div>

          <div className="w-full text-center text-xs text-muted-foreground border-t pt-4">
            * O código QR no verso é dinâmico e encripta os dados de identificação para segurança.
          </div>
        </div>
      </div>
    </div>
  );
}
