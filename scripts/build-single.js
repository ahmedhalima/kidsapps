#!/usr/bin/env node
// Bundles the multi-file project into ONE self-contained HTML file (dist/kids-world.html).
// Useful for sharing a single file or publishing somewhere that needs one file.
//   node scripts/build-single.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'public');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">\n?/g, (_, p) => '<style>\n' + read(p) + '</style>\n');
html = html.replace(/<link rel="manifest"[^>]*>\n?/, '');
const fav = Buffer.from(read('assets/images/favicon.svg')).toString('base64');
html = html.replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="data:image/svg+xml;base64,' + fav + '">');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>\n?/g)];
const bundle = scripts.map(m => '/* ---- ' + m[1] + ' ---- */\n' + read(m[1])).join('\n');
html = html.replace(/<script src="[^"]+"><\/script>\n?/g, '').replace('</body>', '<script>\n' + bundle + '</script>\n</body>');

fs.mkdirSync(path.join(root, '..', 'dist'), { recursive: true });
const out = path.join(root, '..', 'dist', 'kids-world.html');
fs.writeFileSync(out, html);
console.log('Built', path.relative(path.join(root, '..'), out), '(' + Math.round(html.length / 1024) + ' KB, ' + scripts.length + ' scripts inlined)');
