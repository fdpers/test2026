const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
  p.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync('bazi.html', 'utf8') + '</body></html>';
  await p.setContent(html);
  await p.waitForTimeout(500);
  const results = await p.evaluate(() => {
    const S='甲乙丙丁戊己庚辛壬癸', B='子丑寅卯辰巳午未申酉戌亥';
    const gz = i => S[i%10] + B[i%12];
    const pil = r => r.pillars.map(x => S[x.s] + B[x.b]).join(' ');
    const t = [];
    // 1. 日柱双锚点
    let r = computeBazi(2000,1,1,12,0,'m',null);
    t.push(['2000-01-01 四柱', pil(r), '己卯 丙子 戊午 戊午']);
    r = computeBazi(1949,10,1,15,0,'m',null);
    t.push(['1949-10-01 日柱', S[r.pillars[2].s]+B[r.pillars[2].b], '甲子']);
    // 2. 立春界: 2024-02-04 16:27 立春
    r = computeBazi(2024,2,4,10,0,'m',null);
    t.push(['2024-02-04 10:00 年柱', S[r.pillars[0].s]+B[r.pillars[0].b], '癸卯']);
    r = computeBazi(2024,2,4,18,0,'m',null);
    t.push(['2024-02-04 18:00 年柱', S[r.pillars[0].s]+B[r.pillars[0].b], '甲辰']);
    // 3. 节气精度: 清明2025 ≈ 2025-04-04 20:48 北京
    const qm = termJD(2025,15); // UT
    t.push(['清明2025 (北京时)', jdToDate(qm), '≈2025-04-04 20:4x']);
    const lc24 = termJD(2024,315);
    t.push(['立春2024 (北京时)', jdToDate(lc24), '≈2024-02-04 16:2x']);
    // 4. 完整已知例: 1990-06-15 12:30 → 庚午 壬午 辛亥 甲午
    r = computeBazi(1990,6,15,12,30,'m',null);
    t.push(['1990-06-15 12:30 四柱', pil(r), '庚午 壬午 辛亥 甲午']);
    // 5. 晚子时换日: 1990-06-15 23:30 → 日柱壬子, 时柱庚子(壬日起庚子)
    r = computeBazi(1990,6,15,23,30,'m',null);
    t.push(['23:30 日柱(应换次日)', S[r.pillars[2].s]+B[r.pillars[2].b], '壬子']);
    t.push(['23:30 时柱', S[r.pillars[3].s]+B[r.pillars[3].b], '庚子']);
    // 6. 十神自检: 日主辛(金), 庚=劫财, 壬=伤官, 丙=正官
    t.push(['辛见庚', tenGod(7,6), '劫财']);
    t.push(['辛见壬', tenGod(7,8), '伤官']);
    t.push(['辛见丙', tenGod(7,2), '正官']);
    // 7. 大运方向: 庚午年男 → 顺
    r = computeBazi(1990,6,15,12,30,'m',null);
    t.push(['庚年男大运', r.forward?'顺':'逆', '顺']);
    t.push(['第一步大运', gz(r.dayun[0].gz), '癸未']);
    return t;
  });
  let fail=0;
  for (const [name, got, want] of results) {
    const ok = want.startsWith('≈') ? String(got).startsWith(want.slice(1,want.length-1).replace(/x$/,'')) : got===want;
    if(!ok) fail++;
    console.log(`${ok?'PASS':'CHECK'} ${name}: got=${got} want=${want}`);
  }
  await p.locator('nav.tabs button[data-tab="t-paipan"]').click();
  await p.waitForTimeout(300);
  await p.locator('#result').screenshot({ path: 'bz-result.png' });
  console.log(fail===0?'ALL OK':fail+' TO REVIEW');
  await b.close();
})();
