import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'stockfish', 'bin');
const dest = join(root, 'public', 'engine');

if (!existsSync(src)) {
  console.warn('[copy-engine] stockfish package not installed; skipping');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
for (const file of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  copyFileSync(join(src, file), join(dest, file));
}
console.log('[copy-engine] copied Stockfish lite single-threaded build to public/engine');
