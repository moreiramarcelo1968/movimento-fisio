/**
 * Gera os ícones do PWA sem dependências externas.
 * Marca: anel creme interrompido sobre verde profundo, com ponto mostarda.
 *
 * Uso: node scripts/make-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const PINE = [13, 79, 71];
const PINE_DEEP = [9, 59, 53];
const CREAM = [243, 246, 242];
const MARIGOLD = [217, 164, 65];

const SS = 3; // supersampling para bordas suaves

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profundidade
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function drawIcon(size, { padding = 0 } = {}) {
  const big = size * SS;
  const pixels = new Uint8Array(big * big * 4);

  const center = big / 2;
  const usable = (big / 2) * (1 - padding * 2);
  const radius = usable * 0.62;
  const stroke = radius * 0.26;
  const dotRadius = radius * 0.2;
  const gapCenter = -0.52; // radianos, abertura no canto superior direito
  const gapHalf = 0.42;

  const dotAngle = gapCenter;
  const dotX = center + Math.cos(dotAngle) * radius;
  const dotY = center + Math.sin(dotAngle) * radius;

  for (let y = 0; y < big; y += 1) {
    for (let x = 0; x < big; x += 1) {
      const index = (y * big + x) * 4;

      // fundo com leve gradiente diagonal
      const t = Math.min(1, Math.max(0, (x + y) / (big * 2)));
      const background = mix(PINE, PINE_DEEP, t * 0.75);

      let color = background;

      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // anel creme com abertura
      let delta = angle - gapCenter;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const inGap = Math.abs(delta) < gapHalf;

      if (!inGap && Math.abs(distance - radius) <= stroke / 2) {
        color = CREAM;
      }

      // ponto mostarda no centro da abertura
      if (Math.hypot(x + 0.5 - dotX, y + 0.5 - dotY) <= dotRadius) {
        color = MARIGOLD;
      }

      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = 255;
    }
  }

  // reduz com média (antialiasing)
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const index = ((y * SS + sy) * big + (x * SS + sx)) * 4;
          r += pixels[index];
          g += pixels[index + 1];
          b += pixels[index + 2];
        }
      }
      const samples = SS * SS;
      const index = (y * size + x) * 4;
      out[index] = Math.round(r / samples);
      out[index + 1] = Math.round(g / samples);
      out[index + 2] = Math.round(b / samples);
      out[index + 3] = 255;
    }
  }

  return encodePng(size, size, out);
}

function write(file, buffer) {
  const fullPath = path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buffer);
  console.log(`[icons] ${file} (${buffer.length} bytes)`);
}

write("public/icons/icon-192.png", drawIcon(192, { padding: 0.06 }));
write("public/icons/icon-512.png", drawIcon(512, { padding: 0.06 }));
write("public/icons/maskable-512.png", drawIcon(512, { padding: 0.16 }));
write("app/icon.png", drawIcon(512, { padding: 0.06 }));
write("app/apple-icon.png", drawIcon(180, { padding: 0.08 }));
