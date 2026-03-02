import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));

    console.log('Navigating to https://drawreal-ai.vercel.app ...');
    await page.goto('https://drawreal-ai.vercel.app', { waitUntil: 'networkidle2' });

    // wait a bit
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Done.');
    await browser.close();
})();
