import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Estudante } from "@/lib/store";

// Card dimensions: ISO ID-1 (85.6 × 53.98 mm). We render at 4x scale for crisp display.
export const CARD_W = 342; // ~85.5mm @ ~4px/mm
export const CARD_H = 216;

export function useQRDataUrl(payload: string, darkColor: string = "#0f2b5c") {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, {
      margin: 0,
      width: 320,
      errorCorrectionLevel: "M",
      color: { dark: darkColor, light: "#ffffff" },
    })
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [payload, darkColor]);
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

export function getThemeColors(tema?: string) {
  const t = tema || "azul";
  if (t === "verde") {
    return {
      bg: "linear-gradient(135deg, #0b3d1f 0%, #14603a 55%, #1f8a54 100%)",
      primary: "#0b3d1f",
      accent: "#ffffff",
      textAccent: "#ffffff",
      isGold: false,
    };
  } else if (t === "preto") {
    return {
      bg: "linear-gradient(135deg, #18181b 0%, #2d2d30 55%, #434347 100%)",
      primary: "#18181b",
      accent: "#D4AF37",
      textAccent: "#D4AF37",
      isGold: true,
    };
  } else {
    // default: azul
    return {
      bg: "linear-gradient(135deg, #0f2b5c 0%, #173d77 55%, #205bb3 100%)",
      primary: "#0f2b5c",
      accent: "#D4AF37",
      textAccent: "#E2B93C",
      isGold: true,
    };
  }
}

export function CartaoFrente({ e }: { e: Estudante }) {
  const initials = e.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const colors = getThemeColors(e.tema);

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-md text-white select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        background: colors.bg,
      }}
    >
      {/* decorative diagonal band */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 22px)",
        }}
      />
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-16 -top-14 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center border border-white/20 p-0.5 shadow-sm shrink-0">
              <img src="/logo.png" alt="IMETRO" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold tracking-wide">
                UNIVERSIDADE METROPOLITANA
              </div>
              <div
                className="text-[8px] font-semibold tracking-wider"
                style={{ color: colors.textAccent }}
              >
                CARTÃO DE ESTUDANTE
              </div>
            </div>
          </div>
          <div className="text-[8px] text-right opacity-80">
            <div>Ano lectivo</div>
            <div className="font-semibold text-white/95">{e.ano_letivo}</div>
          </div>
        </div>

        {/* Body (Photo + Info) */}
        <div className="mt-3 flex gap-3 flex-1">
          {e.foto ? (
            <div className="w-[74px] h-[92px] rounded-md overflow-hidden bg-slate-100 shrink-0 border border-white/30 shadow-inner">
              <img
                src={e.foto}
                alt={e.nome}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[74px] h-[92px] rounded-md bg-white/95 text-[#0f2b5c] grid place-items-center text-xl font-bold shrink-0 shadow-inner border border-white/40">
              <span style={{ color: colors.primary }}>{initials}</span>
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="text-[8px] uppercase tracking-widest opacity-70">Nome</div>
            <div className="text-[12px] font-semibold leading-tight truncate">{e.nome}</div>
            
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[8px]">
              <div className="col-span-2">
                <div className="opacity-70 uppercase tracking-wider">Nº de Estudante</div>
                <div className="font-mono text-[9px] font-semibold">{e.codigo}</div>
              </div>
              <div className="col-span-2">
                <div className="opacity-70 uppercase tracking-wider">Curso</div>
                <div className="text-[9px] font-medium leading-snug truncate">{e.curso}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1.5 flex items-end justify-between">
          <div className="text-[8px] opacity-75">IMETRO · A Marca da Educação</div>
          <div className="text-[7px] font-mono opacity-80">
            ID {e.id_est.slice(-8).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartaoVerso({ e }: { e: Estudante }) {
  const colors = getThemeColors(e.tema);
  const qr = useQRDataUrl(buildQRPayload(e), colors.primary);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md bg-white border border-slate-200 relative select-none"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Magnetic stripe */}
      <div
        className="h-8 w-full mt-4"
        style={{ backgroundColor: colors.primary }}
      />
      
      <div className="p-4 flex gap-4">
        <div className="flex-1 text-[10px]" style={{ color: colors.primary }}>
          <div className="text-[10px] font-bold">Verificação de Autenticidade</div>
          <p className="mt-1 text-[8px] leading-snug opacity-90">
            Este cartão é propriedade da Universidade Metropolitana de Angola (IMETRO). 
            Em caso de perda ou extravio, por favor devolva aos serviços académicos.
          </p>
          <div className="mt-3.5 space-y-0.5 text-[8px] opacity-90">
            <div>
              <span className="opacity-70 font-semibold">Contacto:</span> +244 923 111 222
            </div>
            <div>
              <span className="opacity-70 font-semibold">Email:</span> secretaria@imetro.ao
            </div>
            <div>
              <span className="opacity-70 font-semibold">Emitido em:</span>{" "}
              {new Date().toLocaleDateString("pt-PT")}
            </div>
          </div>
        </div>
        
        <div className="w-[96px] shrink-0 flex flex-col items-center justify-center">
          {qr ? (
            <img src={qr} alt="QR" className="w-[88px] h-[88px]" />
          ) : (
            <div className="w-[88px] h-[88px] bg-muted animate-pulse rounded" />
          )}
          <div
            className="text-[7px] mt-0.5 font-mono opacity-80"
            style={{ color: colors.primary }}
          >
            {e.codigo}
          </div>
        </div>
      </div>
      
      <div
        className="absolute bottom-2 left-4 right-4 flex justify-between text-[7px] border-t pt-1"
        style={{
          borderColor: `${colors.primary}20`,
          color: `${colors.primary}90`,
        }}
      >
        <span>www.imetro.ao</span>
        <span className="font-medium">Não transmissível</span>
      </div>
    </div>
  );
}

// Draw Front to canvas (Async to allow image loading)
export async function drawCardFrenteCanvas(
  ctx: CanvasRenderingContext2D,
  e: Estudante,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const colors = getThemeColors(e.tema);
  
  // background gradient
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  const themeType = e.tema || "azul";
  
  if (themeType === "verde") {
    g.addColorStop(0, "#0b3d1f");
    g.addColorStop(0.55, "#14603a");
    g.addColorStop(1, "#1f8a54");
  } else if (themeType === "preto") {
    g.addColorStop(0, "#18181b");
    g.addColorStop(0.55, "#2d2d30");
    g.addColorStop(1, "#434347");
  } else {
    // azul
    g.addColorStop(0, "#0f2b5c");
    g.addColorStop(0.55, "#173d77");
    g.addColorStop(1, "#205bb3");
  }
  
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 14);
  ctx.clip();
  
  // diagonal stripes
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  for (let i = -h; i < w; i += 22) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  
  // circles decorative
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(x + w + 10, y + h + 10, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.arc(x + w + 16, y - 14, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const pad = 16;
  const lx = x + pad;
  const ly = y + pad;
  const lr = 14;

  // Load logo.png
  const logoImg = await loadImage("/logo.png").catch(() => null);

  if (logoImg) {
    ctx.save();
    // white circle background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lx + lr, ly + lr, lr, 0, Math.PI * 2);
    ctx.fill();

    // clip to circular badge
    ctx.beginPath();
    ctx.arc(lx + lr, ly + lr, lr - 1.5, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(logoImg, lx + 2, ly + 2, lr * 2 - 4, lr * 2 - 4);
    ctx.restore();

    // border
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(lx + lr, ly + lr, lr, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Fallback: draw initials if image fails
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lx + lr, ly + lr, lr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("UM", lx + lr, ly + lr + 0.5);
  }

  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "bold 9px sans-serif";
  ctx.fillText("UNIVERSIDADE METROPOLITANA", x + pad + 36, y + pad + 12);
  ctx.font = "8px sans-serif";
  ctx.fillStyle = colors.textAccent;
  ctx.fillText("CARTÃO DE ESTUDANTE", x + pad + 36, y + pad + 24);

  // School Year
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.textAlign = "right";
  ctx.font = "8px sans-serif";
  ctx.fillText("Ano lectivo", x + w - pad, y + pad + 12);
  ctx.font = "bold 9px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(e.ano_letivo, x + w - pad, y + pad + 24);

  // Avatar box
  const ax = x + pad,
    ay = y + pad + 40,
    aw = 74,
    ah = 92;
    
  if (e.foto) {
    try {
      const img = await loadImage(e.foto);
      ctx.save();
      // clip to roundRect
      ctx.beginPath();
      roundRect(ctx, ax, ay, aw, ah, 6);
      ctx.clip();
      ctx.drawImage(img, ax, ay, aw, ah);
      ctx.restore();
      
      // border
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRect(ctx, ax, ay, aw, ah, 6);
      ctx.stroke();
    } catch {
      // Fallback to initials if image fails
      drawInitials(ctx, ax, ay, aw, ah, e.nome, colors.primary);
    }
  } else {
    drawInitials(ctx, ax, ay, aw, ah, e.nome, colors.primary);
  }

  // Info
  const ix = ax + aw + 12;
  const iy = ay + 4;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "8px sans-serif";
  ctx.fillText("NOME", ix, iy);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText(truncate(ctx, e.nome, w - (ix - x) - pad), ix, iy + 10);

  const row1 = iy + 32;
  ctx.font = "8px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("Nº DE ESTUDANTE", ix, row1);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px monospace";
  ctx.fillText(String(e.codigo), ix, row1 + 10);

  const row2 = row1 + 30;
  ctx.font = "8px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("CURSO", ix, row2);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px sans-serif";
  ctx.fillText(truncate(ctx, e.curso, w - (ix - x) - pad), ix, row2 + 10);

  // Footer
  ctx.font = "7px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "left";
  ctx.fillText("IMETRO · A Marca da Educação", x + pad, y + h - pad - 2);
  
  ctx.textAlign = "right";
  ctx.font = "7px monospace";
  ctx.fillText("ID " + e.id_est.slice(-8).toUpperCase(), x + w - pad, y + h - pad - 2);
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  name: string,
  primaryColor: string
) {
  roundRect(ctx, ax, ay, aw, ah, 6);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = primaryColor;
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  ctx.fillText(initials, ax + aw / 2, ay + ah / 2);
}

// Draw Back to canvas
export async function drawCardVersoCanvas(
  ctx: CanvasRenderingContext2D,
  e: Estudante,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const colors = getThemeColors(e.tema);
  
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.stroke();

  // magnetic stripe
  ctx.fillStyle = colors.primary;
  ctx.fillRect(x, y + 18, w, 30);

  const pad = 16;
  ctx.fillStyle = colors.primary;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("Verificação de Autenticidade", x + pad, y + 60);
  ctx.font = "8px sans-serif";
  ctx.fillStyle = "rgba(15,43,92,0.85)";
  wrapText(
    ctx,
    "Este cartão é propriedade da Universidade Metropolitana de Angola (IMETRO). Em caso de perda ou extravio, por favor devolva aos serviços académicos.",
    x + pad,
    y + 74,
    w - 128,
    11
  );

  ctx.font = "8px sans-serif";
  const lines = [
    ["Contacto:", "+244 923 111 222"],
    ["Email:", "secretaria@imetro.ao"],
    ["Emitido em:", new Date().toLocaleDateString("pt-PT")],
  ];
  
  lines.forEach((l, i) => {
    ctx.fillStyle = "rgba(15,43,92,0.65)";
    ctx.fillText(l[0], x + pad, y + 118 + i * 11);
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 8px sans-serif";
    ctx.fillText(l[1], x + pad + 60, y + 118 + i * 11);
    ctx.font = "8px sans-serif"; // reset font style
  });

  // footer line
  ctx.strokeStyle = "rgba(15,43,92,0.15)";
  ctx.beginPath();
  ctx.moveTo(x + pad, y + h - 18);
  ctx.lineTo(x + w - pad, y + h - 18);
  ctx.stroke();
  
  ctx.font = "7px sans-serif";
  ctx.fillStyle = "rgba(15,43,92,0.7)";
  ctx.textAlign = "left";
  ctx.fillText("www.imetro.ao", x + pad, y + h - 14);
  ctx.textAlign = "right";
  ctx.fillText("Não transmissível", x + w - pad, y + h - 14);

  // QR
  const qrDataUrl = await QRCode.toDataURL(buildQRPayload(e), {
    margin: 0,
    width: 200,
    errorCorrectionLevel: "M",
    color: { dark: colors.primary, light: "#ffffff" },
  });
  const img = await loadImage(qrDataUrl);
  const qs = 88;
  ctx.drawImage(img, x + w - pad - qs, y + 60, qs, qs);
  
  ctx.textAlign = "center";
  ctx.font = "7px monospace";
  ctx.fillStyle = "rgba(15,43,92,0.7)";
  ctx.fillText(String(e.codigo), x + w - pad - qs / 2, y + 60 + qs + 3);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Failed to load image"));
    i.src = src;
  });
}
