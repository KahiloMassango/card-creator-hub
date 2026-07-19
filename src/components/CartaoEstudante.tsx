import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Estudante } from "@/lib/store";

// Card dimensions: ISO ID-1 (85.6 × 53.98 mm). We render at 4x scale for crisp display.
export const CARD_W = 342; // ~85.5mm @ ~4px/mm
export const CARD_H = 216;

export function useQRDataUrl(payload: string) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, { margin: 0, width: 320, errorCorrectionLevel: "M", color: { dark: "#0b3d1f", light: "#ffffff" } })
      .then((u) => { if (alive) setUrl(u); })
      .catch(() => {});
    return () => { alive = false; };
  }, [payload]);
  return url;
}

export function buildQRPayload(e: Estudante) {
  return [
    "IMETRO-ID-CARD",
    `id:${e.id_est}`,
    `nome:${e.nome}`,
    `cod:${e.codigo}`,
    `bi:${e.bi}`,
    `curso:${e.curso}`,
    `ano:${e.ano_letivo}`,
  ].join("|");
}

export function CartaoFrente({ e }: { e: Estudante }) {
  const initials = e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-md text-white"
      style={{
        width: CARD_W, height: CARD_H,
        background: "linear-gradient(135deg, #0b3d1f 0%, #14603a 55%, #1f8a54 100%)",
      }}
    >
      {/* decorative diagonal band */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 22px)" }} />
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-16 -top-14 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative h-full flex flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-white text-[#0b3d1f] grid place-items-center font-bold text-sm">iM</div>
            <div className="leading-tight">
              <div className="text-[11px] font-semibold tracking-wide">INSTITUTO METROPOLITANO</div>
              <div className="text-[9px] opacity-80">CARTÃO DE ESTUDANTE</div>
            </div>
          </div>
          <div className="text-[9px] text-right opacity-80">
            <div>Ano lectivo</div>
            <div className="font-semibold text-white/95">{e.ano_letivo}</div>
          </div>
        </div>

        <div className="mt-3 flex gap-3 flex-1">
          <div className="w-[74px] h-[92px] rounded-md bg-white/95 text-[#0b3d1f] grid place-items-center text-2xl font-bold shrink-0 shadow-inner border border-white/40">
            {initials}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="text-[9px] uppercase tracking-widest opacity-70">Nome</div>
            <div className="text-[13px] font-semibold leading-tight truncate">{e.nome}</div>
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
              <div>
                <div className="opacity-70 uppercase tracking-wider">Código</div>
                <div className="font-mono text-[10px] font-semibold">{e.codigo}</div>
              </div>
              <div>
                <div className="opacity-70 uppercase tracking-wider">BI</div>
                <div className="font-mono text-[10px] font-semibold truncate">{e.bi}</div>
              </div>
              <div className="col-span-2">
                <div className="opacity-70 uppercase tracking-wider">Curso</div>
                <div className="text-[10px] font-medium leading-snug">{e.curso}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div className="text-[8px] opacity-80">Válido enquanto estudante inscrito</div>
          <div className="text-[8px] font-mono opacity-90">ID {e.id_est.slice(-8).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

export function CartaoVerso({ e }: { e: Estudante }) {
  const qr = useQRDataUrl(buildQRPayload(e));
  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white border border-border relative"
         style={{ width: CARD_W, height: CARD_H }}>
      {/* magnetic stripe */}
      <div className="h-8 w-full bg-[#0b3d1f] mt-4" />
      <div className="p-4 flex gap-4">
        <div className="flex-1 text-[10px] text-[#0b3d1f]">
          <div className="text-[11px] font-semibold">Verificação de autenticidade</div>
          <p className="mt-1 text-[9px] leading-snug text-[#0b3d1f]/80">
            Este cartão é propriedade do Instituto Metropolitano.
            Em caso de perda, entregue nos serviços académicos.
          </p>
          <div className="mt-3 space-y-0.5 text-[9px]">
            <div><span className="opacity-70">Contacto:</span> +244 900 000 000</div>
            <div><span className="opacity-70">Email:</span> secretaria@imetro.ao</div>
            <div><span className="opacity-70">Emitido em:</span> {new Date().toLocaleDateString("pt-PT")}</div>
          </div>
        </div>
        <div className="w-[96px] shrink-0 flex flex-col items-center justify-center">
          {qr ? (
            <img src={qr} alt="QR" className="w-[92px] h-[92px]" />
          ) : (
            <div className="w-[92px] h-[92px] bg-muted animate-pulse rounded" />
          )}
          <div className="text-[8px] mt-1 text-[#0b3d1f]/70 font-mono">{e.codigo}</div>
        </div>
      </div>
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[8px] text-[#0b3d1f]/60 border-t border-[#0b3d1f]/10 pt-1">
        <span>www.imetro.ao</span>
        <span>Não transmissível</span>
      </div>
    </div>
  );
}

// Utility: rasterize a DOM node to PNG via canvas (no external html2canvas dep — we render directly to canvas)
export function drawCardFrenteCanvas(ctx: CanvasRenderingContext2D, e: Estudante, x: number, y: number, w: number, h: number) {
  // background gradient
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#0b3d1f"); g.addColorStop(0.55, "#14603a"); g.addColorStop(1, "#1f8a54");
  roundRect(ctx, x, y, w, h, 14); ctx.fillStyle = g; ctx.fill();

  ctx.save(); ctx.beginPath(); roundRect(ctx, x, y, w, h, 14); ctx.clip();
  // diagonal stripes
  ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 2;
  for (let i = -h; i < w; i += 22) {
    ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + h, y + h); ctx.stroke();
  }
  // circles
  ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.beginPath(); ctx.arc(x + w + 10, y + h + 10, 80, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.arc(x + w + 16, y - 14, 80, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const pad = 16;
  // logo
  roundRect(ctx, x + pad, y + pad, 28, 28, 6); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.fillStyle = "#0b3d1f"; ctx.font = "bold 14px sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "center";
  ctx.fillText("iM", x + pad + 14, y + pad + 15);

  ctx.fillStyle = "#fff"; ctx.textAlign = "left";
  ctx.font = "600 10px sans-serif"; ctx.fillText("INSTITUTO METROPOLITANO", x + pad + 36, y + pad + 12);
  ctx.font = "8px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("CARTÃO DE ESTUDANTE", x + pad + 36, y + pad + 24);

  ctx.textAlign = "right"; ctx.font = "8px sans-serif";
  ctx.fillText("Ano lectivo", x + w - pad, y + pad + 12);
  ctx.font = "600 10px sans-serif"; ctx.fillStyle = "#fff";
  ctx.fillText(e.ano_letivo, x + w - pad, y + pad + 24);

  // avatar box
  const ax = x + pad, ay = y + pad + 40, aw = 74, ah = 92;
  roundRect(ctx, ax, ay, aw, ah, 8); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.fillStyle = "#0b3d1f"; ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const initials = e.nome.split(" ").map(n => n[0]).slice(0, 2).join("");
  ctx.fillText(initials, ax + aw / 2, ay + ah / 2);

  // info
  const ix = ax + aw + 12; const iy = ay + 4;
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "8px sans-serif";
  ctx.fillText("NOME", ix, iy);
  ctx.fillStyle = "#fff"; ctx.font = "600 12px sans-serif";
  ctx.fillText(truncate(ctx, e.nome, w - (ix - x) - pad), ix, iy + 10);

  const row1 = iy + 32;
  ctx.font = "8px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText("CÓDIGO", ix, row1);
  ctx.fillStyle = "#fff"; ctx.font = "600 10px monospace"; ctx.fillText(String(e.codigo), ix, row1 + 10);

  ctx.font = "8px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText("BI", ix + 96, row1);
  ctx.fillStyle = "#fff"; ctx.font = "600 10px monospace"; ctx.fillText(e.bi, ix + 96, row1 + 10);

  const row2 = row1 + 30;
  ctx.font = "8px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText("CURSO", ix, row2);
  ctx.fillStyle = "#fff"; ctx.font = "600 10px sans-serif";
  ctx.fillText(truncate(ctx, e.curso, w - (ix - x) - pad), ix, row2 + 10);

  // footer
  ctx.font = "7px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.textAlign = "left"; ctx.fillText("Válido enquanto estudante inscrito", x + pad, y + h - pad - 4);
  ctx.textAlign = "right"; ctx.font = "7px monospace";
  ctx.fillText("ID " + e.id_est.slice(-8).toUpperCase(), x + w - pad, y + h - pad - 4);
}

export async function drawCardVersoCanvas(ctx: CanvasRenderingContext2D, e: Estudante, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 14); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.stroke();

  // magnetic stripe
  ctx.fillStyle = "#0b3d1f"; ctx.fillRect(x, y + 18, w, 30);

  const pad = 16;
  ctx.fillStyle = "#0b3d1f"; ctx.textBaseline = "top"; ctx.textAlign = "left";
  ctx.font = "600 11px sans-serif";
  ctx.fillText("Verificação de autenticidade", x + pad, y + 60);
  ctx.font = "9px sans-serif"; ctx.fillStyle = "rgba(11,61,31,0.8)";
  wrapText(ctx, "Este cartão é propriedade do Instituto Metropolitano. Em caso de perda, entregue nos serviços académicos.", x + pad, y + 76, w - 128, 12);

  ctx.font = "9px sans-serif"; ctx.fillStyle = "#0b3d1f";
  const lines = [
    ["Contacto:", "+244 900 000 000"],
    ["Email:", "secretaria@imetro.ao"],
    ["Emitido em:", new Date().toLocaleDateString("pt-PT")],
  ];
  lines.forEach((l, i) => {
    ctx.fillStyle = "rgba(11,61,31,0.6)"; ctx.fillText(l[0], x + pad, y + 118 + i * 12);
    ctx.fillStyle = "#0b3d1f"; ctx.fillText(l[1], x + pad + 60, y + 118 + i * 12);
  });

  // footer line
  ctx.strokeStyle = "rgba(11,61,31,0.15)"; ctx.beginPath();
  ctx.moveTo(x + pad, y + h - 18); ctx.lineTo(x + w - pad, y + h - 18); ctx.stroke();
  ctx.font = "7px sans-serif"; ctx.fillStyle = "rgba(11,61,31,0.6)";
  ctx.textAlign = "left"; ctx.fillText("www.imetro.ao", x + pad, y + h - 14);
  ctx.textAlign = "right"; ctx.fillText("Não transmissível", x + w - pad, y + h - 14);

  // QR
  const qrDataUrl = await QRCode.toDataURL(buildQRPayload(e), { margin: 0, width: 200, errorCorrectionLevel: "M", color: { dark: "#0b3d1f", light: "#ffffff" } });
  const img = await loadImage(qrDataUrl);
  const qs = 92;
  ctx.drawImage(img, x + w - pad - qs, y + 60, qs, qs);
  ctx.textAlign = "center"; ctx.font = "7px monospace"; ctx.fillStyle = "rgba(11,61,31,0.7)";
  ctx.fillText(String(e.codigo), x + w - pad - qs / 2, y + 60 + qs + 4);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
