// Run with npm run test:browser after installing Playwright and its Chromium browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'))}
process.env.PORT='8767';require('../dev-server.cjs');
(async()=>{
 const browser=await playwright.chromium.launch({headless:true,...(process.env.BUILD_TEST_CHROMIUM?{executablePath:process.env.BUILD_TEST_CHROMIUM}:{}),args:['--no-sandbox','--disable-gpu','--no-zygote']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,acceptDownloads:true});const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());
 await page.goto('http://127.0.0.1:8767');
 await page.getByRole('button',{name:'Start your build'}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('button',{name:'Import my plan'}).click();
 await page.locator('#planCsvFileInput').setInputFiles(path.resolve('sample-plan.csv'));
 await page.locator('#confirmPlan').waitFor();
 await page.locator('#importName').fill('London training');await page.locator('#importStart').fill('2027-02-01');await page.locator('#confirmPlan').click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('build.plan')).sessions.length),6);
 const stored=await page.evaluate(()=>localStorage.getItem('build.plan'));
 await page.locator('#planFileInput').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"weeks":12,"sessions":[{"week":1}]}')});
 await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('valid weekday'));
 assert.equal(await page.evaluate(()=>localStorage.getItem('build.plan')),stored);
 await page.getByRole('button',{name:'Activity',exact:true}).click();await page.locator('#manualActivity').click();
 await page.locator('#runName').fill('Sunday long run');await page.locator('#runDate').fill('2027-02-07');await page.locator('#runDistance').fill('24');await page.locator('#runTime').fill('1:55:00');await page.locator('#saveRun').click();
 await page.locator('[data-match]').first().click();
 assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('build.assessments'))).length),0,'Matching must not invent a score');
 await page.locator('[data-close]').click();
 assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('build.assessments'))).length),0,'Cancel must preserve assessments');
 await page.locator('[data-activity]').first().click();await page.locator('[data-match]').first().click();
 await page.locator('[data-rate="nailed"]').click();await page.locator('summary').click();await page.locator('#reviewNotes').fill('Held the planned effort.');await page.locator('#saveReview').click();
 assert.equal(await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('build.assessments')))[0].score),100);
 await page.getByRole('button',{name:'Plan',exact:true}).click();await page.getByRole('button',{name:'W2',exact:true}).click();await page.getByRole('button',{name:'Today',exact:true}).click();
 assert.ok(await page.getByText('Week 1 of 2',{exact:true}).count());
 await page.getByRole('button',{name:'Progress',exact:true}).click();await page.getByText('Build pillars',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No mobile horizontal overflow');
 await page.screenshot({path:'/tmp/build-progress-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const download=page.waitForEvent('download');await page.locator('#exportBackup').click();const backup=await download;const buffer=fs.readFileSync(await backup.path());const data=JSON.parse(buffer);assert.equal(data.format,'BUILD_BACKUP');assert.equal(data.activities.length,1);
 await page.locator('#resetData').click();await page.getByRole('button',{name:'Start your build'}).waitFor();
 await page.locator('#backupFileInput').setInputFiles({name:'backup.json',mimeType:'application/json',buffer});await page.locator('#confirmRestore').click();
 assert.equal(await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('build.assessments')))[0].notes),'Held the planned effort.');
 await page.getByRole('button',{name:'Activity',exact:true}).click();
 const csv='Activity ID,Activity Name,Activity Type,Activity Date,Distance,Moving Time\n42,Easy run,Run,2027-02-08,10,45:00';
 for(let i=0;i<2;i++){
  await page.locator('#activityFileInput').setInputFiles({name:'activities.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});await page.locator('#confirmActivities').click();
 }
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('build.activities')).length),2,'Duplicate CSV import must not duplicate runs');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#editBuildGoal').click();await page.locator('#editName').fill('Andy');await page.locator('#saveGoal').click();
 await page.getByRole('button',{name:'Today',exact:true}).click();await page.screenshot({path:'/tmp/build-today-mobile.png',fullPage:true});
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();
 await page.getByRole('button',{name:'Activity',exact:true}).click();assert.ok(await page.getByText('Reviewed runs',{exact:true}).count());
 await page.locator('[data-session]').first().click();await page.getByText('Held the planned effort.',{exact:true}).waitFor();
 assert.deepEqual(errors,[],'No browser JavaScript errors');
 console.log('PASS mobile browser: onboarding/import preview, invalid import preservation, manual run, match/cancel/save, week browsing, review history, backup download/restore, CSV deduplication, goal edit, offline reload.');
 await browser.close();process.exit(0);
})().catch(error=>{console.error(error);process.exit(1)});
