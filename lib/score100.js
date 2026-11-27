/* The guide's score out of 100 (27 November 2026, scale v1).

   One rule for every venue, printed on /methodology/ and beside every matrix:
   ten criteria a visitor can check before booking, each with its weight, the
   evidence found and where it was found. A cell with nothing readable scores
   0. Facebook and Instagram pages cannot be read without an account, so they
   score 0 on the criteria that need a website; that is said too.

   Criteria taken from the Google listing (rating, reviews, hours, position)
   are recomputed at every build from the snapshot in places.json. Criteria
   taken from each venue's own website (prices, booking, English, hygiene,
   treatments) come from data/bareme-100.json, read on the date it carries;
   hand checks (a review read in full, a cell corrected) are stored there too,
   review by review, so a check only applies while that same review is shown.

   Nothing in this file knows which venue is the pick. */
const fs=require('fs');

const W={
  nails:{note:20,avis:10,prix:15,resa:5,anglais:10,hyg:10,soins:10,heures:5,plage:10,site:5},
  spa:{note:20,avis:10,prix:15,resa:5,anglais:10,hyg:10,soins:10,heures:5,plage:10,site:5},
  /* massage-da-nang.com (scale v1, 27/11/2026): the editors' list for massage, no named-staff criterion. */
  massage:{note:25,avis:0,prix:15,resa:5,anglais:10,hyg:10,soins:15,heures:5,plage:10,site:5},
};
const SOINS={
  nails:[['biab','BIAB'],['gelx','Gel-X or extensions'],['pedicure','pedicure'],['headspa','head spa']],
  spa:[['headspa','head spa'],['pieds','foot massage'],['visage','facial'],['massage_corps','body massage'],['ongles','nails or pedicure']],
  massage:[['massage_corps','body massage'],['pieds','foot massage'],['headspa','head spa'],['pierres','hot stone'],['pression','Thai, shiatsu or acupressure']],
};
const ALLKEYS=['note','avis','prix','resa','anglais','hyg','soins','heures','plage','site'];

/* Column labels: short, one line, the weight shown under each. */
const LAB={
  en:{k:{note:'Google',avis:'Named staff',prix:'Prices',resa:'Booking',anglais:'English',hyg:'Hygiene',soins:'Treatments',heures:'Hours',plage:'Beach',site:'Website'},
      venue:'Venue',score:'Score',rank:'#',google:'Google rating',top:'Top 5 on our 100-point score',caption:'Points per criterion, out of the weight shown. Google figures are the snapshot of {d}; websites were read on {s}.',method:'How the 100 points are given',of:'/100'},
  fr:{k:{note:'Google',avis:'Avis nominatifs',prix:'Prix',resa:'Réservation',anglais:'Anglais',hyg:'Hygiène',soins:'Soins',heures:'Horaires',plage:'Plage',site:'Site'},
      venue:'Salon',score:'Note',rank:'#',google:'Note Google',top:'Les 5 premiers sur notre note sur 100',caption:'Points par critère, sur le poids indiqué. Chiffres Google : instantané du {d} ; sites lus le {s}.',method:'Comment les 100 points sont donnés',of:'/100'},
  vi:{k:{note:'Google',avis:'Đánh giá nêu tên',prix:'Bảng giá',resa:'Đặt lịch',anglais:'Tiếng Anh',hyg:'Vệ sinh',soins:'Dịch vụ',heures:'Giờ mở cửa',plage:'Gần biển',site:'Website'},
      venue:'Cơ sở',score:'Điểm',rank:'#',google:'Điểm Google',top:'Top 5 theo thang điểm 100 của chúng tôi',caption:'Điểm theo từng tiêu chí, trên trọng số ghi kèm. Số liệu Google: ảnh chụp ngày {d}; website đọc ngày {s}.',method:'Cách chấm 100 điểm',of:'/100'},
  ko:{k:{note:'구글',avis:'담당자 언급 리뷰',prix:'가격표',resa:'예약',anglais:'영어',hyg:'위생',soins:'시술',heures:'영업시간',plage:'해변',site:'웹사이트'},
      venue:'업체',score:'점수',rank:'#',google:'구글 평점',top:'100점 만점 기준 상위 5곳',caption:'항목별 점수(괄호 안은 배점). 구글 수치는 {d} 스냅샷, 웹사이트는 {s}에 확인.',method:'100점 배점 방식',of:'/100'},
  zh:{k:{note:'谷歌',avis:'点名技师的评价',prix:'价目表',resa:'预约',anglais:'英语',hyg:'卫生',soins:'项目',heures:'营业时间',plage:'海滩',site:'官网'},
      venue:'店铺',score:'得分',rank:'#',google:'谷歌评分',top:'按我们的百分制排名前五',caption:'各项得分（括号内为满分）。谷歌数据为{d}的快照；官网于{s}查阅。',method:'百分制如何打分',of:'/100'},
  ja:{k:{note:'Google',avis:'担当者名入りの口コミ',prix:'料金表',resa:'予約',anglais:'英語',hyg:'衛生',soins:'メニュー',heures:'営業時間',plage:'ビーチ',site:'公式サイト'},
      venue:'店舗',score:'スコア',rank:'#',google:'Google評価',top:'100点満点スコアの上位5店',caption:'項目ごとの得点（括弧内は配点）。Googleの数値は{d}のスナップショット、公式サイトは{s}に確認。',method:'100点の配点',of:'/100'},
  ru:{k:{note:'Google',avis:'Отзывы с именем мастера',prix:'Цены',resa:'Запись',anglais:'Английский',hyg:'Гигиена',soins:'Услуги',heures:'Часы',plage:'Пляж',site:'Сайт'},
      venue:'Салон',score:'Балл',rank:'#',google:'Оценка Google',top:'Первая пятёрка по нашей 100-балльной шкале',caption:'Баллы по каждому критерию (в скобках максимум). Данные Google: снимок от {d}; сайты прочитаны {s}.',method:'Как начисляются 100 баллов',of:'/100'},
  de:{k:{note:'Google',avis:'Namentliche Bewertungen',prix:'Preise',resa:'Buchung',anglais:'Englisch',hyg:'Hygiene',soins:'Leistungen',heures:'Öffnungszeiten',plage:'Strand',site:'Website'},
      venue:'Salon',score:'Punkte',rank:'#',google:'Google-Bewertung',top:'Die Top 5 auf unserer 100-Punkte-Skala',caption:'Punkte je Kriterium, von der angegebenen Gewichtung. Google-Zahlen: Stand {d}; Websites gelesen am {s}.',method:'Wie die 100 Punkte vergeben werden',of:'/100'},
  es:{k:{note:'Google',avis:'Reseñas con nombre',prix:'Precios',resa:'Reserva',anglais:'Inglés',hyg:'Higiene',soins:'Servicios',heures:'Horario',plage:'Playa',site:'Web'},
      venue:'Salón',score:'Puntos',rank:'#',google:'Nota de Google',top:'Los 5 primeros en nuestra escala de 100 puntos',caption:'Puntos por criterio, sobre el peso indicado. Datos de Google: captura del {d}; webs leídas el {s}.',method:'Cómo se reparten los 100 puntos',of:'/100'},
  th:{k:{note:'Google',avis:'รีวิวที่ระบุชื่อช่าง',prix:'ราคา',resa:'การจอง',anglais:'ภาษาอังกฤษ',hyg:'สุขอนามัย',soins:'บริการ',heures:'เวลาเปิด',plage:'ชายหาด',site:'เว็บไซต์'},
      venue:'ร้าน',score:'คะแนน',rank:'#',google:'คะแนน Google',top:'5 อันดับแรกตามคะแนนเต็ม 100 ของเรา',caption:'คะแนนแต่ละเกณฑ์ (ในวงเล็บคือคะแนนเต็ม) ข้อมูล Google ณ {d} อ่านเว็บไซต์เมื่อ {s}',method:'วิธีให้คะแนน 100 คะแนน',of:'/100'},
};

/* Names that open a sentence or describe the salon, never a person. */
const NOT_A_NAME=new Set(('I She He They We You The My Our This That It Its Everything Everyone Staff Service Services Very Highly Thank Thanks Great Amazing Love Loved Best Definitely Price Prices Gel Nails Nail Spa Head Hair Massage Da Nang Vietnam Vietnamese Korean English Japanese Chinese Overall Also Really Super Good Nice Excellent Perfect Beautiful Lovely Wonderful Fantastic Awesome Absolutely Will Would Recommend Recommended Booked Came Went Got Had Have Has Was Is Are Been Did Do Does Made Make Took Take First Second Last Today Yesterday Then After Before When While Here There Their Them Him Her His Hers Mine Me Us Owner Manager Boss Team Girls Ladies Lady Girl Technician Therapist Artist Shop Salon Store Place Room Ambiance Atmosphere Cleanliness Clean Friendly Professional Quality Value Money Cheap Expensive Reasonable Fast Quick Slow Hello Hi Wow Omg Ok Okay Yes No Not All Both Each Every Some Many Much More Most Less Least Strongly Totally Such So Too Even Just Only Still Again Back Next Time Day Days Week Month Year Hotel Beach Street Road Grab Google Maps Instagram Facebook Kakao Zalo Whatsapp WhatsApp Mr Mrs Ms Miss Madam Sir Dear God Thankyou Merci Gracias Danke Lot Lots Free Tea Water Coffee Drink Drinks Foot Feet Hands Hand Toe Toes Manicure Pedicure Mani Pedi Acrylic Biab BIAB Extensions Extension Design Designs Colour Color Colors Colours Cat Eye French Chrome Ombre Christmas Halloween Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Australia America Australian American British Russian Germany German France Korea Japan China Thailand Bali Hanoi Saigon Hoi An What Pinterest Interior Cambodia But').split(' '));
const NM='(\\p{Lu}[\\p{Ll}]{1,11})';
const RX=[
  new RegExp(`(?<!\\p{L})${NM},?\\s+(?:did|was|is|has|gave|made|took|painted|helped|worked|really|does|always|treated|massaged|washed|explained|listened|created|nailed|understood|spoke|speaks)(?!\\p{L})`,'gu'),
  new RegExp(`(?<!\\p{L})${NM}\\s*(?:\\(|,)?\\s*(?:the|my|our|who)\\s+(?:nail\\s+)?(?:technician|artist|therapist|masseuse|tech|staff)`,'gu'),
  new RegExp(`(?<!\\p{L})${NM}\\s+(?:&|and)\\s+${NM}\\s+(?:did|were|was|gave|made|took)(?!\\p{L})`,'gu'),
];
const PRE=/(?<!\p{L})(?:by|with|from|ask for|asked for|recommend|recommending|request|thanks to|thank you so much|thank you|thanks|shout out to|shoutout to|special thanks to|technician|tech|artist|therapist|masseuse|masseur|girl|lady|staff member|named|called|name is),?\s+(?:named\s+|called\s+|ms\.?\s+|miss\s+|chị\s+|em\s+|mr\.?\s+|mrs\.?\s+)?(\p{L}{2,12})(?!\p{L})/giu;
function staffName(txt,venueName){
  const venue=new Set((String(venueName).match(/\p{L}+/gu)||[]).map(w=>w.toLowerCase()));
  const ok=g=>g&&/^\p{Lu}\p{Ll}{1,11}$/u.test(g)&&!NOT_A_NAME.has(g)&&!venue.has(g.toLowerCase());
  for(const r of [RX[0]]){ r.lastIndex=0; let m; while((m=r.exec(txt))) if(ok(m[1])) return m[1]; }
  PRE.lastIndex=0; let m; while((m=PRE.exec(txt))) if(ok(m[1])) return m[1];
  for(const r of RX.slice(1)){ r.lastIndex=0; let x; while((x=r.exec(txt))) for(const g of x.slice(1)) if(ok(g)) return g; }
  return '';
}
const ENG_YES=/(speaks?|spoke|speaking|spoken|communicat\w*)\s+(?:very\s+|really\s+|super\s+|quite\s+)?(?:good|great|excellent|fluent|perfect|amazing|nice|well in|in|decent|fine|clear)?\s*english|english[\s-](?:speaking|spoken)|(?:good|great|excellent|fluent|perfect)\s+english|english\s+(?:was|is)\s+(?:good|great|excellent|fluent|perfect|very good)/i;
const ENG_NO=/(n[o']t|little|limited|barely|without|no|poor|broken|bit of|some)\s+(?:\w+\s+){0,3}english|english\s+(?:was|is)\s+(?:limited|poor|not)/i;

module.exports=function(ctx){
  const {PLACES,KIND,FILE='./data/bareme-100.json',bayes,PLACES_DATE,LISTING,esc,human}=ctx;
  if(!fs.existsSync(FILE)) return null;
  const D=JSON.parse(fs.readFileSync(FILE,'utf8'));
  const Wt=W[KIND], FA=D.faits||{}, CO=D.corrections||{};
  const KEYS=ALLKEYS.filter(k=>Wt[k]>0);     /* a criterion with no weight is not shown */
  /* A venue that entered the Google snapshot after the websites were read has
     no website facts and would score 0 on those criteria: say so at build time. */
  const miss=PLACES.filter(p=>!FA[p.id]).length;
  if(miss) process.stdout.write(`::warning::score100: ${miss} venue(s) have no website reading in ${FILE} (read ${D.sites_lus}). Re-run the reading: releve.py, releve_rendu.py, reextraire.py, export_bareme.py (~/.claude/seo-index/danang-100-2711/).\n`);
  const km=(a,b)=>{const la=(a[0]+b[0])/2*Math.PI/180;return Math.hypot((a[0]-b[0])*111.32,(a[1]-b[1])*111.32*Math.cos(la));};
  const toShore=(lat,lng)=>{let best=99;const R=D.rivage;for(let i=0;i<R.length-1;i++)for(let t=0;t<=50;t++){const q=[R[i][0]+t/50*(R[i+1][0]-R[i][0]),R[i][1]+t/50*(R[i+1][1]-R[i][1])];best=Math.min(best,km([lat,lng],q));}return best;};
  const r1=x=>Math.round(x*10)/10;
  const cache=new Map();
  const crit=p=>{
    if(cache.has(p.id)) return cache.get(p.id);
    const f=FA[p.id]||{st:'aucun'}, co=CO[p.id]||{}, lu=f.st==='lu', c={};
    const b=bayes(p);
    c.note={pts:r1(b/5*Wt.note),max:Wt.note,proof:`${Number(p.rating).toFixed(1)} from ${p.reviews.toLocaleString('en-GB')} Google reviews (weighted score ${b.toFixed(2)} of 5)`,src:p.maps||''};
    const named=[];
    (p.reviewList||[]).slice(0,5).forEach(rv=>{
      const ov=(co.avis||{});
      const n=Object.prototype.hasOwnProperty.call(ov,rv.author)?ov[rv.author]:staffName(rv.text||'',p.name);
      if(n) named.push(`${n} (review by ${rv.author})`);
    });
    c.avis={pts:Wt.avis?Math.min(Wt.avis,2*named.length):0,max:Wt.avis,proof:named.length?`${named.length} of the ${Math.min(5,(p.reviewList||[]).length)} reviews Google shows first name the person who did the treatment: ${named.join(', ')}`:`none of the ${Math.min(5,(p.reviewList||[]).length)} reviews Google shows first names the person who did the treatment`,src:p.maps||''};
    const pp=(lu&&f.np>=5?10:0)+(lu&&f.nd>=3?5:0);
    c.prix={pts:pp,max:Wt.prix,proof:lu?(pp?`${f.np>=5?'price list in text':'no price list in text'}${f.nd>=3?', with durations':', no durations'} on its website`:'no price list in text found on its website'):(f.st==='reseau'?'social page only (not readable without an account)':'no website'),src:lu?(f.psrc||f.url):''};
    const wa=(lu&&f.wa)||/wa\.me|whatsapp/i.test(p.site||''), bk=lu&&f.bk, om=lu&&f.om, soc=f.st==='reseau';
    c.resa={pts:(wa||bk)?5:((om||soc)?3:(p.phone?1:0)),max:Wt.resa,proof:wa?'WhatsApp link':(bk?'online booking':(om?'other messaging app (Zalo, Kakao, Messenger)':(soc?'messaging through its social page':(p.phone?'telephone only':'no booking channel published')))),src:lu?f.url:(p.site||'')};
    let conf=null;
    for(const rv of (p.reviewList||[]).slice(0,5)){const t=rv.text||'',m=t.match(ENG_YES);if(m&&!ENG_NO.test(t.slice(Math.max(0,m.index-40),m.index+m[0].length+10))){conf=rv.author;break;}}
    const decl=lu&&f.ang;
    c.anglais={pts:(decl?5:0)+(conf?5:0),max:Wt.anglais,proof:`${decl?`stated on its website (“${f.ang.ex}”)`:'not stated on a readable website'}; ${conf?`confirmed in a Google review (${conf})`:'not confirmed in the reviews Google shows first'}`,src:decl?f.ang.src:(p.maps||'')};
    if(co.hygiene) c.hyg={pts:co.hygiene.points,max:Wt.hyg,proof:co.hygiene.proof_en||co.hygiene.preuve,src:co.hygiene.source};
    else c.hyg={pts:lu&&f.hyg?5:0,max:Wt.hyg,proof:lu&&f.hyg?`described on its website (“${f.hyg.ex}”); no verifiable proof (equipment model, photo, certificate) found`:'not described on a readable website',src:lu&&f.hyg?f.hyg.src:''};
    const ex=co.soins_exclus||{};
    const have=SOINS[KIND].filter(([k])=>!ex[k]).filter(([k])=>k==='ongles'?lu&&(f.soins||[]).some(x=>['pedicure','biab','gelx'].includes(x)):lu&&(f.soins||[]).includes(k)).map(([,l])=>l);
    c.soins={pts:r1(have.length*Wt.soins/SOINS[KIND].length),max:Wt.soins,proof:lu?(have.length?`on its website: ${have.join(', ')}`:'none of the listed treatments found on its website'):'menu not readable',src:lu?f.url:''};
    const days=(p.hours||[]).filter(x=>x&&!/closed|đóng/i.test(x)).length;
    c.heures={pts:days>=7?5:(days?3:0),max:Wt.heures,proof:(p.hours||[]).length?`${days} days a week on its Google listing`:'no hours on its Google listing',src:p.maps||''};
    const d=toShore(p.lat,p.lng);
    c.plage={pts:d<=1?10:(d<=2?6:(d<=3?3:0)),max:Wt.plage,proof:`${d.toFixed(2)} km in a straight line from the shore at My Khe`,src:''};
    c.site={pts:f.st==='lu'?5:(['injoignable','reseau'].includes(f.st)?2:0),max:Wt.site,proof:{lu:'a website in its own name',injoignable:`a website that did not load on ${D.sites_lus}`,reseau:'a social page only',aucun:'no website on its Google listing'}[f.st]||'no website',src:p.site||''};
    const total=r1(KEYS.reduce((s,k)=>s+c[k].pts,0));
    ALLKEYS.filter(k=>!Wt[k]).forEach(k=>{delete c[k];});
    const out={total,c};
    cache.set(p.id,out);
    return out;
  };
  const total=p=>crit(p).total;
  const fmtDate=(iso,lang)=>{try{return new Date(iso+'T00:00:00Z').toLocaleDateString(lang==='en'?'en-GB':lang,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});}catch(e){return iso;}};
  const L=lang=>LAB[lang]||LAB.en;
  /* The matrix: one row per venue, one column per criterion, the total first. */
  const matrix=(list,lang='en',o={})=>{
    const T=L(lang), rows=list.slice(0,o.limit||list.length), base=o.base||'';
    const cap=T.caption.replace('{d}',fmtDate(PLACES_DATE,lang)).replace('{s}',fmtDate(D.sites_lus,lang));
    return `<div class="tw mx"><table class="data mxt"><caption>${esc(cap)} <a href="/methodology/">${esc(T.method)}</a>.</caption>
<thead><tr><th scope="col">${T.rank}</th><th scope="col">${esc(T.venue)}</th><th scope="col">${esc(T.score)}<small>${T.of}</small></th>${KEYS.map(k=>`<th scope="col">${esc(T.k[k])}<small>${Wt[k]}</small></th>`).join('')}<th scope="col">${esc(T.google)}</th></tr></thead>
<tbody>${rows.map((p,i)=>{const s=crit(p);return `<tr><td class="mxr">${i+1}</td><th scope="row" data-r="${i+1}"><a href="${base}${LISTING.path}${p.slug}/">${esc(p.name)}</a></th><td class="mxs" data-l="${esc(T.score)}"><b>${s.total}</b><small>${T.of}</small></td>${KEYS.map(k=>`<td title="${esc(s.c[k].proof)}" data-l="${esc(T.k[k])} /${Wt[k]}"${s.c[k].pts===0?' class="z"':''}>${s.c[k].pts}</td>`).join('')}<td class="mxg" data-l="${esc(T.google)}">${Number(p.rating).toFixed(1)} (${p.reviews.toLocaleString('en-GB')})</td></tr>`;}).join('')}</tbody></table></div>`;
  };
  /* The same top five as a list, for the answer block (the sentence version stays for schema and meta). */
  const top5html=(list,lang='en')=>`<ol class="t5">${list.slice(0,5).map((p,i)=>`<li><span class="t5n">${i+1}</span><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a><span class="t5s">${total(p)}<small>${L(lang).of}</small></span></li>`).join('')}</ol>`;
  const top5=(list,lang='en')=>list.slice(0,5).map((p,i)=>`${i+1}. ${p.name} (${total(p)}${L(lang).of})`).join(', ');
  /* The profile's own breakdown: what was found and where. */
  const detail=(p,rank)=>{
    const s=crit(p), T=LAB.en;
    return `<h2>Score on this guide: ${s.total}/100${rank?` (${esc(rank)})`:''}</h2>
<div class="tw"><table class="data mxd"><thead><tr><th scope="col">Criterion</th><th scope="col">Points</th><th scope="col">What we found</th><th scope="col">Source</th></tr></thead><tbody>
${KEYS.map(k=>`<tr><th scope="row">${esc(T.k[k])}</th><td>${s.c[k].pts} / ${s.c[k].max}</td><td>${esc(s.c[k].proof)}</td><td>${s.c[k].src?`<a href="${esc(s.c[k].src)}" rel="nofollow noopener">${esc(String(s.c[k].src).replace(/^https?:\/\/(www\.)?/,'').replace(/\?.*$/,'').slice(0,40))}</a>`:'Google coordinates'}</td></tr>`).join('')}
</tbody></table></div>
<p class="m">Google figures: snapshot of ${esc(fmtDate(PLACES_DATE,'en'))}. Websites read on ${esc(fmtDate(D.sites_lus,'en'))}. The same ${['','one','two','three','four','five','six','seven','eight','nine','ten'][KEYS.length]} criteria apply to every venue: <a href="/methodology/">how the 100 points are given</a>.</p>`;
  };
  const methodEN=()=>{
    const it=SOINS[KIND].map(([,l])=>l).join(', ');
    return `<h2>The score out of 100</h2>
<p>Every venue is scored on the same ${['','one','two','three','four','five','six','seven','eight','nine','ten'][KEYS.length]} criteria, chosen for a visitor who speaks English, stays near the beach and wants a treatment without a surprise at the counter. The weights were set by the editors on ${esc(fmtDate(D.fixe,'en'))}, before any venue was scored, and are the same for everyone. A criterion with nothing readable scores 0. Facebook and Instagram pages cannot be read without an account, so a venue whose only page is there scores 0 on the criteria that need a website.</p>
<div class="tw"><table class="data"><thead><tr><th scope="col">Criterion</th><th scope="col">Points</th><th scope="col">How it is scored</th><th scope="col">Source</th></tr></thead><tbody>
<tr><th scope="row">Google rating weighted by volume</th><td>${Wt.note}</td><td>The Bayesian average below, out of 5, converted to ${Wt.note} points.</td><td>Google listing</td></tr>
${Wt.avis?`<tr><th scope="row">Reviews that name the person who did the treatment</th><td>${Wt.avis}</td><td>2 points per review, among the five reviews Google shows first on the listing. Read by hand for the venues at the top.</td><td>Google listing</td></tr>`:''}
<tr><th scope="row">Prices published</th><td>${Wt.prix}</td><td>A price list in text on the venue's own website: 10. Durations published: 5.</td><td>Venue's website</td></tr>
<tr><th scope="row">Booking</th><td>${Wt.resa}</td><td>WhatsApp or online booking: 5. Another messaging app or a social page: 3. Telephone only: 1.</td><td>Website, Google listing</td></tr>
<tr><th scope="row">English</th><td>${Wt.anglais}</td><td>Stated by the venue on its website: 5. Confirmed in one of the five reviews Google shows first: 5.</td><td>Website, Google listing</td></tr>
<tr><th scope="row">Hygiene</th><td>${Wt.hyg}</td><td>Described on its website (sterilisation, single-use tools): 5. Verifiable proof, such as the equipment's model, a photo of it or a certificate: 10.</td><td>Venue's website</td></tr>
<tr><th scope="row">Range of treatments</th><td>${Wt.soins}</td><td>${esc(it)}: equal shares, found on its published menu.</td><td>Venue's website</td></tr>
<tr><th scope="row">Opening hours</th><td>${Wt.heures}</td><td>Published on Google for all seven days: 5. Fewer days: 3.</td><td>Google listing</td></tr>
<tr><th scope="row">Distance to the beach</th><td>${Wt.plage}</td><td>Straight line to the shore at My Khe: up to 1 km 10, up to 2 km 6, up to 3 km 3.</td><td>Google coordinates</td></tr>
<tr><th scope="row">Own website</th><td>${Wt.site}</td><td>A website in its own name: 5. A website that did not load, or a social page only: 2.</td><td>Google listing</td></tr>
</tbody></table></div>
<p>Not scored: whether the venue answers its reviews. Neither Google's public listing nor its API shows the answers to everyone in the same way, so it cannot be checked equally for all.</p>
<p>Google figures are the snapshot of ${esc(fmtDate(PLACES_DATE,'en'))} and change at each monthly refresh. Websites were read on ${esc(fmtDate(D.sites_lus,'en'))}, with the page rendered as a browser shows it; the evidence for each cell, and where it was found, is on each venue's page. Ties are broken by the Bayesian average, then by the number of reviews.</p>`;
  };
  /* Figures of our own, computed from the snapshot and the website reading at
     every build, dated, and summed up in one sentence near the top of every
     ranking (instruction of 27/11/2026: data nobody else publishes). */
  const closesLate=p=>{const h=(p.hours||[])[0]||'';if(/24 hours/i.test(h)) return true;
    const m=h.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i);if(!m) return false;let H=+m[1]%12+(m[3].toUpperCase()==='PM'?12:0);
    return H>=22||H<6;};
  const med=a=>{const v=[...a].sort((x,y)=>x-y);if(!v.length) return null;const h=v.length>>1;return v.length%2?v[h]:(v[h-1]+v[h])/2;};
  const STATS=(()=>{
    const n=PLACES.length, f=p=>FA[p.id]||{st:'aucun'};
    let rv=0,nm=0;
    if(Wt.avis) PLACES.forEach(p=>{const co=(CO[p.id]||{}).avis||{};(p.reviewList||[]).slice(0,5).forEach(r=>{rv++;const x=Object.prototype.hasOwnProperty.call(co,r.author)?co[r.author]:staffName(r.text||'',p.name);if(x) nm++;});});
    const d=PLACES.map(p=>toShore(p.lat,p.lng));
    const prices=PLACES.map(p=>f(p).p).filter(Boolean).map(x=>x.k);
    return {n,own:PLACES.filter(p=>f(p).st==='lu').length,social:PLACES.filter(p=>f(p).st==='reseau').length,
      priced:PLACES.filter(p=>f(p).st==='lu'&&f(p).np>=5).length,timed:PLACES.filter(p=>f(p).st==='lu'&&f(p).np>=5&&f(p).nd>=3).length,
      english:PLACES.filter(p=>f(p).st==='lu'&&f(p).ang).length,hygiene:PLACES.filter(p=>crit(p).c.hyg.pts>=5).length,
      named:rv?Math.round(100*nm/rv):null,reviewsRead:rv,near:d.filter(x=>x<=1).length,medKm:med(d),
      late:PLACES.filter(closesLate).length,price:med(prices),priceN:prices.length};
  })();
  const ITEM={nails:{en:'a full-colour gel manicure',fr:'une manucure gel couleur',vi:'sơn gel màu',ko:'젤 컬러',zh:'全色凝胶美甲',ja:'ジェルカラー',ru:'гель-лака на руки',de:'einer Gel-Maniküre',es:'una manicura de gel',th:'ทาสีเจล'},
    spa:{en:'a 60-minute head spa',fr:'un head spa de 60 minutes',vi:'gội đầu dưỡng sinh 60 phút',ko:'헤드스파 60분',zh:'60分钟头疗',ja:'ヘッドスパ60分',ru:'60-минутного хэд-спа',de:'eines 60-minütigen Head Spa',es:'un head spa de 60 minutos',th:'เฮดสปา 60 นาที'},
    massage:{en:'a 60-minute body massage',fr:'un massage du corps de 60 minutes',vi:'massage body 60 phút',ko:'60분 바디 마사지',zh:'60分钟全身按摩',ja:'60分のボディマッサージ',ru:'60-минутного массажа тела',de:'einer 60-minütigen Körpermassage',es:'un masaje corporal de 60 minutos',th:'นวดตัว 60 นาที'}}[KIND];
  const NOUN={nails:{en:'nail salons',fr:'salons de manucure'},spa:{en:'head spa houses',fr:'maisons de head spa'},massage:{en:'massage venues',fr:'adresses de massage'}}[KIND];
  const nf=(x,lang)=>String(Math.round(x*10)/10).replace('.',lang==='fr'||lang==='de'||lang==='es'||lang==='ru'||lang==='vi'?',':'.');
  const dataLine=(lang='en')=>{
    const S=STATS, dt=fmtDate(D.sites_lus,lang), pr=S.price?`${Math.round(S.price)}K`:'';
    const T={
      en:()=>`Our own count of ${dt}: of ${S.n} ${NOUN.en}, ${S.priced} publish a price list on a website of their own, ${S.english} state there that English is spoken and ${S.near} are within 1 km of My Khe beach${S.named!=null?`; ${S.named}% of the reviews Google shows first name the person who did the treatment`:''}${pr?`; median published price of ${ITEM.en}: ${pr} VND (${S.priceN} venues)`:''}.`,
      fr:()=>`Notre décompte du ${dt} : sur ${S.n} ${NOUN.fr}, ${S.priced} publient une liste de prix sur un site à leur nom, ${S.english} y déclarent l'anglais et ${S.near} sont à moins de 1 km de la plage de My Khe${S.named!=null?` ; ${S.named} % des avis que Google montre en premier nomment la personne qui a fait le soin`:''}${pr?` ; prix médian publié pour ${ITEM.fr} : ${pr} VND (${S.priceN} adresses)`:''}.`,
      vi:()=>`Số liệu tự đếm ngày ${dt}: trong ${S.n} cơ sở, ${S.priced} công bố bảng giá trên website riêng, ${S.english} ghi rõ nói tiếng Anh, ${S.near} cách biển Mỹ Khê dưới 1 km${S.named!=null?`; ${S.named}% đánh giá Google hiển thị đầu tiên nêu tên người làm`:''}${pr?`; giá công bố trung vị cho ${ITEM.vi}: ${pr} VND (${S.priceN} cơ sở)`:''}.`,
      ko:()=>`자체 집계(${dt}): ${S.n}곳 중 자체 웹사이트에 가격표 공개 ${S.priced}곳, 영어 가능 명시 ${S.english}곳, 미케 해변 1km 이내 ${S.near}곳${S.named!=null?`; 구글이 먼저 보여 주는 리뷰의 ${S.named}%가 시술자 이름 언급`:''}${pr?`; ${ITEM.ko} 공개 가격 중앙값 ${pr} VND(${S.priceN}곳)`:''}.`,
      zh:()=>`本站统计（${dt}）：${S.n}家中，${S.priced}家在自己网站公布价目表，${S.english}家写明可说英语，${S.near}家距美溪海滩1公里内${S.named!=null?`；谷歌优先显示的评价中${S.named}%提到技师姓名`:''}${pr?`；${ITEM.zh}公布价格中位数${pr}越南盾（${S.priceN}家）`:''}。`,
      ja:()=>`当サイトの集計（${dt}）：${S.n}店のうち、公式サイトで料金表を公開${S.priced}店、英語対応を明記${S.english}店、ミーケービーチから1km以内${S.near}店${S.named!=null?`。Googleが最初に表示する口コミの${S.named}%が施術者の名前に言及`:''}${pr?`。${ITEM.ja}の公開価格の中央値${pr}VND（${S.priceN}店）`:''}。`,
      ru:()=>`Наш подсчёт на ${dt}: из ${S.n} заведений ${S.priced} публикуют прайс на своём сайте, ${S.english} указывают, что говорят по-английски, ${S.near} находятся в 1 км от пляжа Микхе${S.named!=null?`; ${S.named}% отзывов, которые Google показывает первыми, называют мастера по имени`:''}${pr?`; медианная опубликованная цена ${ITEM.ru}: ${pr} VND (${S.priceN} заведений)`:''}.`,
      de:()=>`Unsere Zählung vom ${dt}: Von ${S.n} Betrieben veröffentlichen ${S.priced} eine Preisliste auf der eigenen Website, ${S.english} geben Englisch an und ${S.near} liegen höchstens 1 km vom Strand My Khe entfernt${S.named!=null?`; ${S.named} % der Bewertungen, die Google zuerst zeigt, nennen die behandelnde Person`:''}${pr?`; mittlerer veröffentlichter Preis ${ITEM.de}: ${pr} VND (${S.priceN} Betriebe)`:''}.`,
      es:()=>`Nuestro recuento del ${dt}: de ${S.n} locales, ${S.priced} publican precios en su propia web, ${S.english} indican que hablan inglés y ${S.near} están a 1 km o menos de la playa de My Khe${S.named!=null?`; el ${S.named} % de las reseñas que Google muestra primero nombra a quien hizo el servicio`:''}${pr?`; precio publicado mediano de ${ITEM.es}: ${pr} VND (${S.priceN} locales)`:''}.`,
      th:()=>`ตัวเลขที่เรานับ (${dt}): จาก ${S.n} ร้าน เผยแพร่ราคาบนเว็บไซต์ของตัวเอง ${S.priced} ร้าน ระบุว่าพูดอังกฤษได้ ${S.english} ร้าน อยู่ห่างหาดหมีเคไม่เกิน 1 กม. ${S.near} ร้าน${S.named!=null?` รีวิวแรกๆ ใน Google ${S.named}% ระบุชื่อช่าง`:''}${pr?` ราคามัธยฐานของ${ITEM.th} ${pr} ดอง (${S.priceN} ร้าน)`:''}`};
    return (T[lang]||T.en)();
  };
  const dataMethodEN=()=>`<h2>Our own figures</h2>
<p>${esc(dataLine('en'))} Also counted: ${STATS.own} have a website of their own (${STATS.social} only a social page), ${STATS.hygiene} describe a hygiene practice, ${STATS.late} close at 22:00 or later, and the median distance to the shore is ${nf(STATS.medKm,'en')} km.</p>
<p>How they are counted: every venue in the Google snapshot is counted once. “A website of its own” and the price list, English and hygiene statements come from the website reading of ${esc(fmtDate(D.sites_lus,'en'))} (pages rendered as a browser shows them). Distances are straight lines from the Google coordinates to the shore at My Khe, drawn through four points (${D.rivage.map(x=>x.join(', ')).join(' ; ')}). Closing times are Monday's hours on Google. ${STATS.named!=null?`The share of reviews that name the person who did the treatment is counted on the ${STATS.reviewsRead} reviews Google shows first for these venues, with a pattern checked by hand for the venues at the top. `:''}${STATS.price?`The median price is taken from the venues whose own website gives a price for ${ITEM.en}, read by hand where the first match was ambiguous.`:''}</p>`;
  return {top5html,crit,total,matrix,top5,detail,methodEN,dataMethodEN,dataLine,STATS,KEYS,W:Wt,D,LAB};
};
module.exports.staffName=staffName;
