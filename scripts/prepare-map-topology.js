// Copies the us-atlas TopoJSON boundary files used by /map into public/topo/
// so they ship as plain static assets fetched at runtime, instead of being
// bundled as JS module imports. Static imports put the full ~950KB of
// topology data inside the /map route's own JS chunk (measured: 1.3MB
// uncompressed before this change, by far the largest chunk in the build) —
// that blocks the chunk's parse/execution and can't be cached separately
// from app code. As a runtime-fetched static file it loads in parallel with
// the PLACES CSV and is cacheable independently.
//
// Copies the files as-is (no geometry simplification): topojson-simplify's
// simplify() leaves filtered-out points as sparse-array holes rather than
// compacting them, which round-trips through JSON.stringify as literal
// `null` entries — that made a naive attempt at this *larger* than the
// original, not smaller. Getting real simplification right needs a proper
// arc-compaction pass, which risks the exact seam/index bugs the mesh()
// approach in +page.svelte was written to avoid. Not worth it for this pass.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'topo');
mkdirSync(outDir, { recursive: true });

const files = ['counties-10m.json', 'states-10m.json'];
for (const file of files) {
  const src = join(__dirname, '..', 'node_modules', 'us-atlas', file);
  const dest = join(outDir, file);
  copyFileSync(src, dest);
  console.log(`Copied ${file} -> public/topo/${file}`);
}
