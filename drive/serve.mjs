// Starts `next dev` against the harness's throwaway database, prisma/test.db —
// never Turso (your real data) and never prisma/dev.db (the old local copy).
//
// .env holds the production Turso credentials (the deploy scripts need them), and
// src/lib/db.ts switches to Turso whenever TURSO_DATABASE_URL is non-empty, so a
// plain `npm run dev` reads AND writes production. Next's env loader never
// overrides a variable that already exists, so passing the Turso pair as empty
// strings and DATABASE_URL as test.db keeps this server on the test file.
//
// Don't try this with PowerShell: `$env:TURSO_DATABASE_URL = ''` deletes the
// variable, and .env then fills it back in with production.
//
//   node serve.mjs          (from drive/)

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { TEST_DATABASE_URL } from './support.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const nextBin = createRequire(new URL('../package.json', import.meta.url)).resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, TURSO_DATABASE_URL: '', TURSO_AUTH_TOKEN: '', DATABASE_URL: TEST_DATABASE_URL },
});

child.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
