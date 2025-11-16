// screenshot.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // configuration
  const base = 'http://localhost:1313';
  const relativeUrls = ['/shortcodes/attachments', '/shortcodes/badge', '/shortcodes/button', '/shortcodes/card', '/shortcodes/cards', '/shortcodes/children', '/shortcodes/expand', '/shortcodes/highlight', '/shortcodes/icon', '/shortcodes/include', '/shortcodes/math', '/shortcodes/mermaid', '/shortcodes/notice', '/shortcodes/openapi', '/shortcodes/resources', '/shortcodes/siteparam', '/shortcodes/tab', '/shortcodes/tabs', '/shortcodes/tree'];

  // iPhone-like viewport and user agent (emulate iPhone X dimensions)
  const iPhoneViewport = { width: 375, height: 812, deviceScaleFactor: 3, isMobile: true };
  const iPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1';
  const ZOOM = 1.5; // zoom final image by 33%

  // iterate over relative URLs and create featured.png in docs/content/<relativeUrl>/featured.png
  for (const rel of relativeUrls) {
    const targetUrl = base + rel;
    console.log('Processing', targetUrl);

    let screenshotBase64;

    try {
      // open a fresh page for each target and emulate iPhone
      const p = await browser.newPage();
      // emulate essential mobile properties
      await p.setViewport(iPhoneViewport);
      await p.setUserAgent(iPhoneUA);

      try {
        await p.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10_000 });
        // move window down 100px so the capture focuses lower on the page
        await p.evaluate(() => window.scrollTo(0, 100));
        // allow layout to settle after scroll
        await new Promise((res) => setTimeout(res, 150));
      } catch (err) {
        console.error(`Failed to navigate to ${targetUrl}:`, err.message);
        await p.close();
        continue; // proceed with next URL
      }

      // capture upper half of the iPhone viewport
      const clip = {
        x: 0,
        y: 0,
        width: iPhoneViewport.width,
        height: Math.floor(iPhoneViewport.height / 2),
      };

      screenshotBase64 = await p.screenshot({ clip, encoding: 'base64' });
      await p.close();
    } catch (err) {
      console.error('Error while taking screenshot for', targetUrl, err.message);
      continue;
    }

    // 2. Create a preview page to apply CSS perspective and save
    try {
      const preview = await browser.newPage();
      // preview viewport scaled a bit larger than clip so transform fits, account for zoom
      const vw2 = Math.max(Math.ceil(iPhoneViewport.width * 2 * ZOOM), 800);
      const vh2 = Math.max(Math.ceil(Math.floor(iPhoneViewport.height / 2) * 2 * ZOOM), 600);
      await preview.setViewport({ width: vw2, height: vh2 });

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              html,body{height:100%;margin:0}
              body{display:flex;align-items:center;justify-content:center;background:#111}
              .frame{display:inline-block;width:${iPhoneViewport.width}px;height:${Math.floor(iPhoneViewport.height / 2)}px;perspective:1200px}
                .card{width:100%;height:100%;position:relative;overflow:hidden;border-radius:6px;transform-origin:top center;transform: scale(${ZOOM}) translateY(-100px) translateX(55px) rotateY(-22deg) rotateX(6deg) skewX(-6deg) translateZ(0);box-shadow: 0 20px 40px rgba(0,0,0,0.6);will-change: transform}
              img{width:100%;height:100%;display:block;border-radius:6px}
                /* stronger subtle gradient: darker in lower-left, fading to transparent in upper-right */
                .overlay{position:absolute;inset:0;pointer-events:none;border-radius:6px;background: linear-gradient(to top left, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.01) 60%, rgba(0,0,0,0) 100%)}
            </style>
          </head>
          <body>
            <div class="frame"><div class="card"><img id="s" src="data:image/png;base64,${screenshotBase64}" /><div class="overlay"></div></div></div>
          </body>
        </html>
      `;

      await preview.setContent(html, { waitUntil: 'networkidle0' });
      await preview.waitForSelector('img#s');
      await preview.evaluate(async () => {
        const img = document.getElementById('s');
        if (!img.complete) await new Promise((res) => (img.onload = res));
      });

      const el = await preview.$('.frame');
      if (!el) {
        console.error('Element not found for', rel);
        await preview.close();
        continue;
      }

      // build filesystem target
      const relClean = rel.replace(/^\//, '');
      const baseDir = path.join(path.dirname(__dirname), '..', '..');
      const targetDir = path.join(baseDir, 'docs', 'content', relClean);
      fs.mkdirSync(targetDir, { recursive: true });
      const outPath = path.join(targetDir, 'featured.png');

      await el.screenshot({ path: outPath });
      console.log('Saved', outPath);

      await preview.close();
    } catch (err) {
      console.error('Error while creating preview for', rel, err.message);
      continue;
    }
  }

  await browser.close();
}

run();
