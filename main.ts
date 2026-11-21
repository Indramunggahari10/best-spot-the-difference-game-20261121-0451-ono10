// main.ts — the Lantern Harbor entrypoint (Node 22, standard library only).
// It hands the game in: copies this repository's game/ and screenshots/
// into the output directory and writes /output/dossier.json with the
// vendored make.fun library, exactly as the gate rebuilds it.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: the same repository always writes the same
// bytes, so the grader's two runs agree byte for byte.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');

if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html is missing: nothing to hand in');
}

const shots = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.'))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}
for (const name of shots) {
  const bytes = statSync(join(shotsDir, name)).size;
  if (bytes > 262144) throw new Error(`screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse, so this program fails the same
// way instead of handing in something invalid.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(out, 'dossier.json'), dossier);

// Read the dossier back and confirm the bytes on disk are exactly the ones
// buildDossier returned; a partial write must fail loudly, never silently.
const written = readFileSync(join(out, 'dossier.json'));
if (!written.equals(dossier)) {
  throw new Error('dossier.json on disk does not match the dossier buildDossier wrote');
}

console.log(`Lantern Harbor handed in: ${shots.length} screenshots, dossier ${dossier.length} bytes`);
