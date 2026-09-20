#!/usr/bin/env node
/* Renders form.html to House5-comfort-survey-EN-SW.pdf at A4.
   The original PDF was made with wkhtmltopdf and its HTML source was never
   kept, so form.html is a rebuild — edit that, then run: node build-pdf.js */
const puppeteer = require('/Users/archwrth/Downloads/ARC/actionresearchprojects.github.io/node_modules/puppeteer');
const path = require('path');

(async () => {
  const b = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--no-sandbox']
  });
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'form.html'), { waitUntil: 'networkidle0' });
  const out = path.join(__dirname, 'House5-comfort-survey-EN-SW.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true,
                margin: { top: '10mm', bottom: '8mm', left: '9mm', right: '9mm' } });
  const pages = await p.evaluate(() => document.body.scrollHeight);
  console.log('wrote', path.basename(out), '— content height', pages, 'px');
  await b.close();
})();
