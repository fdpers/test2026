const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
  p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync('qimen.html', 'utf8') + '</body></html>';
  await p.setContent(html);
  await p.waitForTimeout(600);
  const results = await p.evaluate(() => {
    const S='甲乙丙丁戊己庚辛壬癸';
    const t=[];
    // T1: 阳一局 甲子日甲子时 → 经典伏吟局
    let L = layoutQimen(true,1,0,0);
    t.push(['阳1局地盘一宫',S[L.dipan[1]],'戊']);
    t.push(['阳1局地盘九宫',S[L.dipan[9]],'乙']);
    t.push(['甲子时旬首遁仪',S[L.yi],'戊']);
    t.push(['值符星',L.zhifuStar,'天蓬']);
    t.push(['值使门',L.zhishiDoor,'休']);
    t.push(['值符落宫',String(L.luo),'1']);
    t.push(['伏吟',String(L.fuYin),'true']);
    t.push(['神盘八宫(阳顺:螣蛇)',L.shen[8],'螣蛇']);
    t.push(['神盘三宫(太阴)',L.shen[3],'太阴']);
    // T2: 阳一局 乙丑时 → 时干乙落9宫,值符天蓬到9,反吟
    L = layoutQimen(true,1,0,1);
    t.push(['乙丑时值符落宫',String(L.luo),'9']);
    t.push(['反吟',String(L.fanYin),'true']);
    t.push(['值使休门飞宫',String(L.zhishiPal),'2']);
    t.push(['九宫天盘星',L.tian[9],'天蓬']);
    t.push(['九宫天盘干(蓬携戊)',S[L.tianGan[9][0]],'戊']);
    // T3: 阴九局地盘: 戊9 己8 庚7...乙1
    L = layoutQimen(false,9,0,0);
    t.push(['阴9局地盘九宫',S[L.dipan[9]],'戊']);
    t.push(['阴9局地盘一宫',S[L.dipan[1]],'乙']);
    // T4: 中五宫旬首(阳4局,甲戌旬:仪己在5宫) → 值符天禽,值使死门
    L = layoutQimen(true,4,56,18); // 庚申日壬午时(甲戌旬)
    t.push(['阳4局己落宫',String((()=>{for(let p=1;p<=9;p++)if(L.dipan[p]===5)return p;})()),'5']);
    t.push(['值符(中宫)',L.zhifuStar,'天禽']);
    t.push(['值使(中宫)',L.zhishiDoor,'死']);
    t.push(['时干壬落宫→值符落',String(L.luo),'8']);
    t.push(['值使飞宫(5+8=13→4)',String(L.zhishiPal),'4']);
    // T5: 全流程: 2024-12-22 12:00 → 冬至后,庚申日(符头己未→下元),阳遁4局
    const r = computeQimen(2024,12,22,12,0);
    t.push(['节气',r.term.n,'冬至']);
    t.push(['阴阳遁',r.yang?'阳':'阴','阳']);
    t.push(['三元',['上','中','下'][r.yuan],'下']);
    t.push(['局数',String(r.ju),'4']);
    t.push(['日柱',S[r.dgz%10]+'子丑寅卯辰巳午未申酉戌亥'[r.dgz%12],'庚申']);
    t.push(['时柱',S[r.hgz%10]+'子丑寅卯辰巳午未申酉戌亥'[r.hgz%12],'壬午']);
    // T6: 夏至后 → 阴遁
    const r2 = computeQimen(2025,7,1,10,0);
    t.push(['7月阴阳遁',r2.yang?'阳':'阴','阴']);
    return t;
  });
  let fail=0;
  for (const [name,got,want] of results){
    const ok=got===want; if(!ok)fail++;
    console.log(`${ok?'PASS':'FAIL'} ${name}: got=${got} want=${want}`);
  }
  await p.locator('nav.tabs button[data-tab="t-paipan"]').click();
  await p.waitForTimeout(300);
  await p.screenshot({ path:'qm-board.png', clip:(await p.locator('#juinfo').boundingBox()) ? undefined : undefined, fullPage:false });
  await p.locator('#board').screenshot({ path:'qm-board.png' });
  console.log(fail===0?'ALL OK':fail+' FAILURES');
  await b.close();
})();
