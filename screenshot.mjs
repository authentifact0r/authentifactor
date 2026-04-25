import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'public/images/screenshots');

const sites = [
  { name: 'bowsea',         url: 'https://bowsea.com' },
  { name: 'clarityconduct', url: 'https://www.clarityconduct.com' },
  { name: 'styledbymaryam', url: 'https://styledbymaryam.com' },
  { name: 'careceutical',   url: 'https://careceutical.vercel.app' },
  { name: 'citiestroves',   url: 'https://citiestroves.com' },
  { name: 'vibrantminds',   url: 'https://vibrantmindsasc.org.uk' },
];

const VIEWPORT = { width: 1440, height: 1200, deviceScaleFactor: 2 };

const browser = await puppeteer.launch({ headless: true });

for (const site of sites) {
  const file = path.join(outDir, `${site.name}.jpg`);
  process.stdout.write(`Capturing ${site.name.padEnd(16)} `);
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  try {
    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log('OK');
  } catch (e) {
    console.log(`FAIL: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

await browser.close();
console.log('Done.');
