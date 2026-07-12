const { launchChromium } = require('./pw.cjs');
const http = require('http'); const fs = require('fs');
const html = fs.readFileSync('academy.html','utf8');
const page='<!doctype html><html><head><meta charset="utf-8"></head><body>'+html+'</body></html>';
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(page);});
srv.listen(0, async ()=>{
  const b = await launchChromium();
  const p = await b.newPage({ viewport:{width:1200,height:1100} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:'+srv.address().port+'/'); await p.waitForTimeout(500);
  // weeks: check 3 weeks, verify progress + persistence
  await p.locator('nav.tabs button[data-tab="t-plan"]').click(); await p.waitForTimeout(200);
  const wkCount = await p.locator('.week').count();
  for(const i of [0,1,2]) await p.locator(`input[data-w="${i}"]`).click();
  await p.waitForTimeout(200);
  const ptxt = await p.locator('#ptxt').textContent();
  // quiz: answer all 15 (first option A always => some wrong, deterministic)
  await p.locator('nav.tabs button[data-tab="t-quiz"]').click(); await p.waitForTimeout(200);
  const qCount = await p.locator('.q').count();
  for(let i=0;i<qCount;i++){ await p.locator(`.q[data-qi="${i}"] button[data-oi="0"]`).click(); await p.waitForTimeout(60); }
  const cur = await p.locator('#q-cur').textContent();
  // correct answers count for option-A: q1(a=0) only => expected 1? check listed a values: [0,1,2,3,1, 1,2,0,3,1,2, 1,1,2,1] → a==0 only Q1 and Q8(紫微在卯→丑 a=0) => 2
  console.log('周任务数:', wkCount, '(期望12)');
  console.log('勾选3周后进度:', ptxt, '(期望 3 / 12)');
  console.log('题目数:', qCount, '(期望15)');
  console.log('全选A得分:', cur, '(期望 2 — 仅第1、8题正解为A)');
  // reload persistence
  await p.reload(); await p.waitForTimeout(500);
  await p.locator('nav.tabs button[data-tab="t-plan"]').click(); await p.waitForTimeout(200);
  console.log('刷新后进度保持:', await p.locator('#ptxt').textContent());
  console.log('最好成绩:', await p.locator('#q-best').textContent());
  // screenshots
  await p.locator('nav.tabs button[data-tab="t-map"]').click(); await p.waitForTimeout(200);
  await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:'aca-map.png'});
  await p.locator('nav.tabs button[data-tab="t-quiz"]').click(); await p.waitForTimeout(200);
  await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:'aca-quiz.png'});
  console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'NO JS ERRORS');
  await b.close(); srv.close();
});
