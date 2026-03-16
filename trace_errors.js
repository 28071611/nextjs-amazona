const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error')
      console.log(`PAGE ERROR: ${msg.text()}`);
  });
  
  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: ${exception}`);
  });

  await page.goto('http://localhost:3000/en-US');
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
