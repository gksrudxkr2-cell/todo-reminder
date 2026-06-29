#!/usr/bin/env node
// 1회용 스크립트 — Node 내장 모듈(zlib, fs)만 사용
// 출력: public/icons/notification-icon-192.png, notification-icon-512.png
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── CRC32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG chunk ────────────────────────────────────────────────────────────────
function pngChunk(type, data) {
  const tb  = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crc]);
}

// ── Lightning bolt polygon (normalized 0-1) ───────────────────────────────────
// 6-point polygon, clockwise from top:
//   1→2 left edge of upper blade (down-left)
//   2→3 bottom of notch (right)
//   3→4 left edge of lower blade (down-left)
//   4→5 right edge of lower blade (up-right)
//   5→6 top of notch (right)
//   6→1 right edge of upper blade (up-left)
const BOLT = [
  [0.60, 0.04],
  [0.28, 0.52],
  [0.50, 0.52],
  [0.18, 0.96],
  [0.40, 0.48],
  [0.72, 0.48],
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

// ── PNG generator ─────────────────────────────────────────────────────────────
function generatePng(size) {
  const pad      = Math.round(size * 0.15);
  const boltArea = size - 2 * pad;
  const bolt     = BOLT.map(([nx, ny]) => [pad + nx * boltArea, pad + ny * boltArea]);

  const raw = Buffer.allocUnsafe(size * (1 + size * 3));
  let off = 0;
  for (let y = 0; y < size; y++) {
    raw[off++] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, bolt)) {
        raw[off++] = 0xFF; raw[off++] = 0xFF; raw[off++] = 0xFF; // white
      } else {
        raw[off++] = 0x86; raw[off++] = 0x3B; raw[off++] = 0xFF; // #863bff
      }
    }
  }

  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Write ─────────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.writeFileSync(path.join(outDir, 'notification-icon-192.png'), generatePng(192));
fs.writeFileSync(path.join(outDir, 'notification-icon-512.png'), generatePng(512));
console.log('생성 완료: notification-icon-192.png, notification-icon-512.png');
