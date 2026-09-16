import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG Encoder in pure JavaScript
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // Compression method
  ihdr.writeUInt8(0, 11); // Filter method
  ihdr.writeUInt8(0, 12); // Interlace method

  // Image data (Raw scanlines with Filter 0)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      // Draw gradient / rounded logo style
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = width * 0.45;

      if (dist <= maxR) {
        // Inner logo with H monogram accent
        const inCenter = Math.abs(dx) < width * 0.25 && Math.abs(dy) < height * 0.25;
        if (inCenter && (Math.abs(dx) < width * 0.08 || Math.abs(dy) < height * 0.05)) {
          rawData[offset++] = 255; // White H bar
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else {
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        }
      } else {
        // Transparent or soft background
        rawData[offset++] = 255;
        rawData[offset++] = 255;
        rawData[offset++] = 255;
        rawData[offset++] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const chunk = Buffer.alloc(4 + 4 + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);
    const crc = crc32(chunk.subarray(4, 8 + data.length));
    chunk.writeUInt32BE(crc >>> 0, 8 + data.length);
    return chunk;
  }

  // Simple CRC32 table
  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ -1) >>> 0;
  }

  const crcTable = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Icons for PWA (192, 512, apple-touch-icon)
const icon192 = createPNG(192, 192, 2, 136, 209); // #0288D1
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPNG(512, 512, 2, 136, 209);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconApple = createPNG(180, 180, 2, 136, 209);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), iconApple);

const iconMaskable = createPNG(512, 512, 1, 87, 155); // #01579B
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

console.log('✅ Generated PWA PNG icons successfully in apps/web/public/');
