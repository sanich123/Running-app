import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import process from 'node:process';
import { brotliCompress, constants } from 'node:zlib';
import { promisify } from 'node:util';

const compressBrotli = promisify(brotliCompress);
const compressibleExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.wasm',
  '.webmanifest',
  '.xml',
]);
const minimumSizeBytes = 1024;
const quality = 11;
const outputDirectory = resolve(process.argv[2] ?? 'dist');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

const files = await listFiles(outputDirectory);
let compressedCount = 0;
let originalBytes = 0;
let brotliBytes = 0;

for (const filePath of files) {
  if (!compressibleExtensions.has(extname(filePath).toLowerCase())) continue;

  const { size } = await stat(filePath);
  if (size < minimumSizeBytes) continue;

  const source = await readFile(filePath);
  const compressed = await compressBrotli(source, {
    params: {
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
      [constants.BROTLI_PARAM_QUALITY]: quality,
    },
  });

  await writeFile(`${filePath}.br`, compressed);
  compressedCount += 1;
  originalBytes += source.byteLength;
  brotliBytes += compressed.byteLength;
}

// eslint-disable-next-line no-undef
console.log(`Generated ${compressedCount} Brotli sidecars: ${originalBytes} -> ${brotliBytes} bytes.`);
