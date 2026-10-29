const { chromium, firefox, webkit, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const origin = process.env.BUDGET_QA_ORIGIN || 'http://localhost:3100';
const fresh = '/blog/budget-2026-uk-tax-changes-explained';
const old = '/blog/autumn-budget-2025-uk-tax-changes-explained';
const titles = {
  [fresh]: 'Budget 2026: UK Tax Changes and What to Check',
  [old]: "Autumn Budget 2025: UK Tax Changes Explained - What You'll Actually Pay",
};

fs.mkdirSync(path.resolve('audit-outputs/budget-2026'), {recursive:true});

(async () => {
  const engineName = process.env.BUDGET_QA_BROWSER || 'chromium';
  const engine = {chromium,firefox,webkit}[engineName];
  const browser = await engine.launch(engineName === 'chromium' ? { channel: process.env.BUDGET_QA_CHANNEL || undefined, args: ['--disable-features=TranslateUI', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] } : {});
  console.log(JSON.stringify({engineName,version:browser.version(),channel:process.env.BUDGET_QA_CHANNEL||'bundled'}));
  let failed = false;
  try {
    for (const mobile of [false, true]) {
      for (const serviceWorkers of ['allow', 'block']) {
        const context = await browser.newContext({ viewport: mobile ? {width:390,height:844} : {width:1440,height:1000}, serviceWorkers });
        const page = await context.newPage();
        const events = [];
        page.on('pageerror', error => events.push({type:'pageerror',message:error.message}));
        page.on('requestfailed', request => events.push({type:'requestfailed',path:new URL(request.url()).pathname,error:request.failure()?.errorText}));
        page.on('response', response => { if (response.request().isNavigationRequest()) events.push({type:'document',path:new URL(response.url()).pathname,status:response.status(),sw:response.fromServiceWorker()}); });
        const label = `${mobile?'mobile':'desktop'}-sw-${serviceWorkers}`;
        try {
          const response = await page.goto(origin + fresh, {waitUntil:'load'});
          expect(response.status()).toBe(200);
          await expect(page.getByRole('heading',{name:titles[fresh],exact:true})).toBeVisible();
          const essential = page.getByRole('button',{name:'Essential Only',exact:true});
          if (await essential.isVisible()) await essential.click();
          for (let round = 1; round <= 3; round++) {
            for (const target of [old, fresh]) {
              const start = Date.now();
              const link = page.locator(`article a[href="${target}"]`).first();
              await expect(link).toBeVisible();
              await link.click();
              await page.waitForURL(origin + target,{waitUntil:'load'});
              await expect(page.getByRole('heading',{name:titles[target],exact:true})).toBeVisible({timeout:15000});
              await expect(page.getByText('Loading article...', {exact:true})).toBeHidden();
              console.log(JSON.stringify({label,round,target,pass:true,ms:Date.now()-start}));
            }
          }
          const workerCount = await page.evaluate(async () => navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0);
          console.log(JSON.stringify({label,workerCount,events}));
        } catch (error) {
          failed = true;
          const state = await page.evaluate(() => ({url:location.href,readyState:document.readyState,headings:[...document.querySelectorAll('h1')].map(n=>({text:n.textContent,visible:!!n.getClientRects().length})),loading:document.body.innerText.includes('Loading article...')})).catch(()=>null);
          await page.screenshot({path:path.resolve(`audit-outputs/budget-2026/${label}-failure.png`)}).catch(()=>{});
          console.log(JSON.stringify({label,pass:false,error:error.message,state,events}));
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  if (failed) process.exitCode = 1;
})().catch(error => {console.error(error);process.exitCode=1;});
