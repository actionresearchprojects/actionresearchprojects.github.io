#!/usr/bin/env node
/* Builds survey-offline.html — one self-contained file that runs from file://
   with no network at all, not even once. Fonts and the icon become data URIs,
   and the service-worker registration (meaningless off a web server) is stripped.

   Run this whenever index.html changes:   node build-offline.js
*/
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const SRC = path.join(dir, 'index.html');
const OUT = path.join(dir, 'survey-offline.html');

let html = fs.readFileSync(SRC, 'utf8');
const before = Buffer.byteLength(html);

const dataUri = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(path.join(dir, file)).toString('base64')}`;

// 1. fonts -> data URIs
let fontCount = 0;
html = html.replace(/url\(fonts\/(ubuntu-\d+\.woff2)\)/g, (_, f) => {
  fontCount++;
  return `url(${dataUri('fonts/' + f, 'font/woff2')})`;
});
if (fontCount !== 4) throw new Error(`expected 4 fonts, inlined ${fontCount}`);

// 2. icon -> data URI (favicon + apple-touch-icon)
const icon = dataUri('icons/icon-192.png', 'image/png');
let iconCount = 0;
html = html.replace(/href="icons\/icon-192\.png"/g, () => { iconCount++; return `href="${icon}"`; });
if (iconCount !== 2) throw new Error(`expected 2 icon refs, inlined ${iconCount}`);

// 3. drop what only makes sense on a web server
const sw = /\/\* BUILD_STRIP_SW_START \*\/[\s\S]*?\/\* BUILD_STRIP_SW_END \*\/\n/;
if (!sw.test(html)) throw new Error('service-worker block markers not found');
html = html.replace(sw, '');
html = html.replace(/<link rel="manifest"[^>]*>\n/, '');

// 4. label it, so a stray copy is identifiable
html = html.replace(
  /(<title>)(.*?)(<\/title>)/,
  `$1$2 (offline copy)$3\n<!-- Built by build-offline.js from index.html on ${new Date().toISOString().slice(0, 10)}.\n     Self-contained: no network required. Edit index.html, not this file. -->`
);
const ver = html.match(/version: '([\d.]+)'/);
if (!ver) throw new Error('CFG.version not found');
html = html.replace(ver[0], `version: '${ver[1]}-offline'`);

fs.writeFileSync(OUT, html);

const after = Buffer.byteLength(html);
console.log(`survey-offline.html  ${(after / 1024).toFixed(0)} KB  (from ${(before / 1024).toFixed(0)} KB + ${fontCount} fonts + icon)`);
const leftover = html.match(/(?:src|href)="(?!data:|#)(?:https?:)?\/\/[^"]*"|url\((?!data:|#)[^)]*\)/g);
console.log(leftover ? `WARNING external refs remain: ${leftover.join(', ')}` : 'verified: no external references');
