function jdUT(y,m,d,hFrac){ if(m<=2){y--;m+=12;} const a=Math.floor(y/100), b=2-a+Math.floor(a/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+b-1524.5+hFrac/24; }
function sunLon(jd){ const T=(jd-2451545)/36525, D=Math.PI/180;
  const L0=280.46646+36000.76983*T+0.0003032*T*T;
  const M=(357.52911+35999.05029*T-0.0001537*T*T)*D;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
  return ((L0+C-0.00569-0.00478*Math.sin((125.04-1934.136*T)*D))%360+360)%360; }
function newMoonJDE(k){
  const T=k/1236.85,T2=T*T,T3=T2*T,T4=T3*T,D=Math.PI/180;
  let jde=2451550.09766+29.530588861*k+0.00015437*T2-0.00000015*T3+0.00000000073*T4;
  const E=1-0.002516*T-0.0000074*T2;
  const M=(2.5534+29.1053567*k-0.0000014*T2-0.00000011*T3)*D;
  const Mp=(201.5643+385.81693528*k+0.0107582*T2+0.00001238*T3-0.000000058*T4)*D;
  const F=(160.7108+390.67050284*k-0.0016118*T2-0.00000227*T3+0.000000011*T4)*D;
  const Om=(124.7746-1.56375588*k+0.0020672*T2+0.00000215*T3)*D;
  let c=-0.4072*Math.sin(Mp)+0.17241*E*Math.sin(M)+0.01608*Math.sin(2*Mp)+0.01039*Math.sin(2*F)
   +0.00739*E*Math.sin(Mp-M)-0.00514*E*Math.sin(Mp+M)+0.00208*E*E*Math.sin(2*M)
   -0.00111*Math.sin(Mp-2*F)-0.00057*Math.sin(Mp+2*F)+0.00056*E*Math.sin(2*Mp+M)
   -0.00042*Math.sin(3*Mp)+0.00042*E*Math.sin(M+2*F)+0.00038*E*Math.sin(M-2*F)
   -0.00024*E*Math.sin(2*Mp-M)-0.00017*Math.sin(Om);
  return jde+c;
}
const civ=jd=>Math.floor(jd+8/24+0.5);          // Beijing civil day number
function midClimate(nm){ // 中气 longitude present in month starting at new moon nm (or null)
  const nmNext=(function(){let k=Math.round((nm-2451550.09766)/29.530588861);return newMoonJDE(k+1);})();
}
function lunarOf(y,m,d){
  const jd=jdUT(y,m,d,4), birthCiv=civ(jd);
  let k=Math.round((jd-2451550.09766)/29.530588861)+1;
  while(civ(newMoonJDE(k))>birthCiv)k--;
  while(civ(newMoonJDE(k+1))<=birthCiv)k++;
  const nm=newMoonJDE(k), nmNext=newMoonJDE(k+1);
  const day=birthCiv-civ(nm)+1;
  const monthOf=zl=>{const i=(Math.round(zl/30)+2)%12;return i===0?12:i;};
  let month=null;
  for(let z=0;z<12;z++){ const zl=(270+z*30)%360;
    let g=nm+((zl-sunLon(nm)+360)%360)/0.9856;
    for(let it=0;it<6;it++){const diff=(zl-sunLon(g)+540)%360-180;g+=diff/0.98565;}
    if(civ(g)>=civ(nm)&&civ(g)<civ(nmNext)){month=monthOf(zl);break;}
  }
  const leap=month===null;
  return {month,day,leap};
}
const cases=[
  [2000,2,5,'正月初一'],[2024,2,10,'正月初一'],[2000,1,1,'冬月廿五'],
  [1990,1,27,'正月初一'],[2026,2,17,'正月初一'],[1990,6,15,'五月廿三'],
  [2026,7,4,'五月二十'],[1984,2,2,'正月初一']
];
for(const [y,m,d,exp] of cases){const r=lunarOf(y,m,d);
  console.log(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} => 农历${r.leap?'闰':''}${r.month}月${r.day}日   期望≈${exp}`);}
