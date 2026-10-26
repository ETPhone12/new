// Turns the single-file build into page content for hosts that supply their own
// <html>/<head>/<body> wrapper (for example a shared claude.ai preview).
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('dist-single/index.html', 'utf8');
const pick = (re) => [...src.matchAll(re)].map((m) => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/g)[0] ?? '<title>ENG3C Studio</title>';
const metas = pick(/<meta name="(?:claude:viewport-fit-sides|description)"[^>]*>/g);
const fonts = pick(/<link\s+rel="(?:preconnect|stylesheet)"[^>]*fonts\.g[^>]*>/g);
const styles = pick(/<style[\s\S]*?<\/style>/g);
const scripts = pick(/<script type="module"[\s\S]*?<\/script>/g).map((s) => s.replace(' crossorigin', ''));
const out = [title, ...metas, ...fonts, ...styles, '<div id="root"></div>', ...scripts].join('\n');
writeFileSync('dist-single/eng3c-studio.html', out);
console.log(`dist-single/eng3c-studio.html ${(out.length / 1024).toFixed(0)} KB`);
