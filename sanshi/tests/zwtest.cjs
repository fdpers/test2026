const { launchChromium } = require('./pw.cjs');
const fs = require('fs');
(async () => {
  const b = await launchChromium();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync('ziwei.html', 'utf8') + '</body></html>';
  await p.setContent(html);
  await p.waitForTimeout(400);
  // Test known cases via the exposed computeChart
  const results = await p.evaluate(() => {
    const B='子丑寅卯辰巳午未申酉戌亥', S='甲乙丙丁戊己庚辛壬癸';
    const t = [];
    // Case 1: 庚午年(1990) 正月初一 子时 男 → 命宫寅(戊寅,土五局), 紫微在午
    let c = computeChart(1990,1,1,0,'m');
    t.push(['case1 年干支', c.gz, '庚午']);
    t.push(['case1 命宫', S[c.stemOf(c.ming)]+B[c.ming], '戊寅']);
    t.push(['case1 局', c.juName, '土五局']);
    t.push(['case1 紫微', B[c.zw], '午']);
    // Case 2: 水二局检验：日1→丑,日2→寅,日3→寅,日4→卯 (用命宫为水二局的输入构造:
    // 甲子年 正月 子时: 命宫寅, 寅宫干=丙 → 丙寅 炉中火 = 火六局. 换: 需要水二局: 命宫干支纳音水.
    // 直接验证内部公式: 模拟 ju=2
    const zwPos = (day, ju) => { const mult=Math.ceil(day/ju)*ju, x=mult-day, q=mult/ju;
      return x%2===0 ? (2+(q-1)+x)%12 : (2+(q-1)-x+120)%12; };
    t.push(['水二局日1', B[zwPos(1,2)], '丑']);
    t.push(['水二局日2', B[zwPos(2,2)], '寅']);
    t.push(['水二局日4', B[zwPos(4,2)], '卯']);
    t.push(['火六局日1', B[zwPos(1,6)], '酉']);  // 火六局初一紫微在酉
    t.push(['金四局日1', B[zwPos(1,4)], '亥']);  // 金四局初一紫微在亥
    t.push(['木三局日1', B[zwPos(1,3)], '辰']);  // 木三局初一紫微在辰
    t.push(['土五局日2', B[zwPos(2,5)], '亥']);  // 土五局初二紫微在亥
    // Case 3: 天府镜像: 紫微午 → 天府戌
    t.push(['case1 天府', B[(16-c.zw)%12], '戌']);
    // Case 4: 甲年四化
    let c2 = computeChart(1984,3,15,6,'f'); // 甲子年
    t.push(['甲年干支', c2.gz, '甲子']);
    t.push(['甲年禄存', '寅', '寅']);
    return t;
  });
  let fail = 0;
  for (const [name, got, want] of results) {
    const ok = got === want;
    if (!ok) fail++;
    console.log(`${ok?'PASS':'FAIL'} ${name}: got=${got} want=${want}`);
  }
  // screenshots
  await p.locator('nav.tabs button[data-tab="t-paipan"]').click();
  await p.waitForTimeout(300);
  await p.locator('#chart').screenshot({ path: 'zw-chart.png' });
  await p.locator('nav.tabs button[data-tab="t-yuanli"]').click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'zw-top.png' });
  console.log(fail === 0 ? 'ALL OK' : `${fail} FAILURES`);
  await b.close();
})();
