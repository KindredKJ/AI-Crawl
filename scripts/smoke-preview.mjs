import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const host = 'http://127.0.0.1:4173';
const child = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
let logs = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding('utf8');
  stream.on('data', (part) => {
    logs += part;
    if (logs.length > 20000) logs = logs.slice(-20000);
  });
}
async function read(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(url + ' returned HTTP ' + response.status);
  return { response, text: await response.text() };
}
try {
  let page;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error('Preview server exited: ' + child.exitCode);
    try {
      page = await read(host + '/');
      break;
    } catch (error) {
      if (attempt === 39) throw error;
      await sleep(250);
    }
  }
  if (!page.response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Production preview did not return HTML');
  }
  if (!page.text.includes('<title>AI Crawl</title>') || !page.text.includes('id="root"')) {
    throw new Error('Expected AI Crawl application shell missing from built page');
  }
  const assets = [...new Set([...page.text.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1]))];
  if (assets.length === 0 || !assets.some(p => p.endsWith('.js'))) {
    throw new Error('Production build did not reference any JavaScript assets');
  }
  for (const asset of assets) {
    const result = await read(new URL(asset, host));
    if (!result.text.length) throw new Error('Empty asset: ' + asset);
    console.log('Verified HTTP 200: ' + asset + ' (' + result.text.length + ' chars)');
  }
  console.log('Production preview: HTTP 200, application shell and ' + assets.length + ' bundled asset(s) verified');
} catch (error) {
  console.error(error);
  console.error(logs);
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
}
