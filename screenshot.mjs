import puppeteer from 'puppeteer';

const sites = [
  // Retake problem screenshots at taller viewport for better card fit
  { name: 'clarityconduct', url: 'https://www.clarityconduct.com', file: '/Users/olu/naija-pantry/public/images/screenshots/clarityconduct.png', width: 1440, height: 1200 },
  { name: 'vibrantminds', url: 'https://vibrantmindsasc.org.uk', file: '/Users/olu/naija-pantry/public/images/screenshots/vibrantminds.png', width: 1440, height: 1200 },
  { name: 'careceutical', url: 'https://careceutical.vercel.app', file: '/Users/olu/naija-pantry/public/images/screenshots/careceutical.png', width: 1440, height: 1200 },
  { name: 'bowsea', url: 'https://placementsportal-81608.web.app', file: '/Users/olu/naija-pantry/public/images/screenshots/bowsea.png', width: 1440, height: 1200 },
];

const browser = await puppeteer.launch({ headless: true });

for (const site of sites) {
  console.log(`Capturing ${site.name}...`);
  const page = await browser.newPage();
  await page.setViewport({ width: site.width, height: site.height, deviceScaleFactor: 2 });
  try {
    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: site.file, type: 'png' });
    console.log(`  ✓ Saved`);
  } catch (e) {
    console.log(`  ✗ Failed: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

await browser.close();
console.log('Done.');
