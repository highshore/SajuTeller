// Minimal QR code encoder (byte mode, error correction level M, versions 1–10) for the companion-caption link.
// Kept in-house so the share link (which carries the room's decryption key in its #fragment) is never
// sent to a third-party QR image service. Returns a square matrix of dark (true) / light (false) modules.

type Block = readonly [ecPerBlock: number, g1Blocks: number, g1Data: number, g2Blocks: number, g2Data: number];
// ISO/IEC 18004 table 9, level M.
const LEVEL_M: readonly Block[] = [
  [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
  [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44],
];
const ALIGN: readonly (readonly number[])[] = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
export const QR_MAX_BYTES = 213; // version 10-M in byte mode

// ---- GF(256) arithmetic, primitive polynomial x^8+x^4+x^3+x^2+1 ----
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}
const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) { next[j] ^= poly[j]; next[j + 1] ^= mul(poly[j], EXP[i]); }
    poly = next;
  }
  return poly;
}

export function rsRemainder(data: readonly number[], degree: number): number[] {
  const gen = rsGenerator(degree);
  const rem = new Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.shift(); rem.push(0);
    for (let i = 0; i < degree; i++) rem[i] ^= mul(gen[i + 1], factor);
  }
  return rem;
}

function bchFormat(mask: number): number {
  const data = (0b00 << 3) | mask; // level M = 00
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}
function bchVersion(version: number): number {
  let rem = version;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
  return (version << 12) | rem;
}

function encodeData(bytes: Uint8Array, version: number): number[] {
  const [ec, b1, d1, b2, d2] = LEVEL_M[version - 1];
  const capacity = b1 * d1 + b2 * d2;
  const bits: number[] = [];
  const push = (value: number, length: number) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  push(0b0100, 4);
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let pad = 0; codewords.length < capacity; pad++) codewords.push(pad % 2 ? 0x11 : 0xec);
  // split into blocks, add error correction, interleave
  const blocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < b1 + b2; i++) {
    const size = i < b1 ? d1 : d2;
    blocks.push(codewords.slice(offset, offset + size));
    offset += size;
  }
  const ecBlocks = blocks.map(b => rsRemainder(b, ec));
  const out: number[] = [];
  for (let i = 0; i < Math.max(d1, d2); i++) for (const b of blocks) if (i < b.length) out.push(b[i]);
  for (let i = 0; i < ec; i++) for (const b of ecBlocks) out.push(b[i]);
  return out;
}

const MASKS: readonly ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  r => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;
  // rule 1: runs of 5+ same-colour modules in a row/column
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      let run = 1;
      for (let j = 1; j < n; j++) {
        const a = pass ? m[j][i] : m[i][j];
        const b = pass ? m[j - 1][i] : m[i][j - 1];
        if (a === b) { run++; if (run === 5) score += 3; else if (run > 5) score++; } else run = 1;
      }
    }
  }
  // rule 2: 2×2 blocks
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
  }
  // rule 3: finder-like patterns
  const pat = [true, false, true, true, true, false, true];
  for (let r = 0; r < n; r++) for (let c = 0; c + 6 < n; c++) {
    const rowMatch = pat.every((p, k) => m[r][c + k] === p);
    const colMatch = pat.every((p, k) => m[c + k][r] === p);
    for (const [match, get] of [[rowMatch, (k: number) => m[r][k]], [colMatch, (k: number) => m[k][r]]] as const) {
      if (!match) continue;
      const before = [c - 4, c - 3, c - 2, c - 1].every(k => k < 0 || !get(k));
      const after = [c + 7, c + 8, c + 9, c + 10].every(k => k >= n || !get(k));
      if (before || after) score += 40;
    }
  }
  // rule 4: dark/light balance
  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  score += Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;
  return score;
}

export function encodeQr(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  let version = 1;
  for (; version <= 10; version++) {
    const [, b1, d1, b2, d2] = LEVEL_M[version - 1];
    const header = 4 + (version < 10 ? 8 : 16);
    if (header + bytes.length * 8 <= (b1 * d1 + b2 * d2) * 8) break;
  }
  if (version > 10) throw new Error('QR payload too long');
  const n = 17 + version * 4;
  const modules: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  const reserved: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  const set = (r: number, c: number, v: boolean) => { if (r >= 0 && c >= 0 && r < n && c < n) { modules[r][c] = v; reserved[r][c] = true; } };

  // finder patterns + separators
  for (const [fr, fc] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      const dark = inside && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      set(fr + r, fc + c, dark);
    }
  }
  // timing patterns
  for (let i = 8; i < n - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  // alignment patterns
  const pos = ALIGN[version - 1];
  for (const r of pos) for (const c of pos) {
    if ((r === 6 && c === 6) || (r === 6 && c === pos[pos.length - 1]) || (r === pos[pos.length - 1] && c === 6)) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }
  // reserve format areas (filled later) and the dark module
  for (let i = 0; i < 9; i++) { reserved[8][i] = true; reserved[i][8] = true; }
  for (let i = 0; i < 8; i++) { reserved[8][n - 1 - i] = true; reserved[n - 1 - i][8] = true; }
  set(n - 8, 8, true);
  // version information (v7+)
  if (version >= 7) {
    const v = bchVersion(version);
    for (let i = 0; i < 18; i++) {
      const bit = ((v >> i) & 1) === 1;
      const a = Math.floor(i / 3), b = (i % 3) + n - 11;
      set(a, b, bit); set(b, a, bit);
    }
  }

  // place data bits in the zigzag order
  const data = encodeData(bytes, version);
  const bits: number[] = [];
  for (const cw of data) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  const dataPos: [number, number][] = [];
  let k = 0;
  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < n; vert++) {
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? n - 1 - vert : vert;
        if (!reserved[r][c]) {
          modules[r][c] = k < bits.length ? bits[k] === 1 : false;
          k++;
          dataPos.push([r, c]);
        }
      }
    }
  }

  const withMask = (mask: number) => {
    const m = modules.map(row => row.slice());
    for (const [r, c] of dataPos) if (MASKS[mask](r, c)) m[r][c] = !m[r][c];
    const f = bchFormat(mask);
    const bit = (i: number) => ((f >> i) & 1) === 1;
    // first copy, around the top-left finder (m[row][col])
    for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
    m[7][8] = bit(6);
    m[8][8] = bit(7);
    m[8][7] = bit(8);
    for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
    // second copy, split between top-right and bottom-left
    for (let i = 0; i < 8; i++) m[8][n - 1 - i] = bit(i);
    for (let i = 8; i < 15; i++) m[n - 15 + i][8] = bit(i);
    m[n - 8][8] = true;
    return m;
  };

  let best = withMask(0);
  let bestScore = penalty(best);
  for (let mask = 1; mask < 8; mask++) {
    const candidate = withMask(mask);
    const s = penalty(candidate);
    if (s < bestScore) { best = candidate; bestScore = s; }
  }
  return best;
}

/** Renders the matrix as a compact SVG path (one unit per module, 4-module quiet zone). */
export function qrSvgPath(m: boolean[][]): { size: number; d: string } {
  const quiet = 4;
  let d = '';
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c + quiet} ${r + quiet}h1v1h-1z`; }));
  return { size: m.length + quiet * 2, d };
}
