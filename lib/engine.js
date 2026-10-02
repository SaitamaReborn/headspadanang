/* Shared engine for the Da Nang guide sites — zero dependencies.
   Data in, HTML out. Both sites pass a config; everything else is common:
   salon pages, area pages, street pages, service pages, i18n, schema, sitemap. */
const fs=require('fs'),path=require('path');
const {PICK_LOC}=require('./pick-i18n.js');

const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slugify=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/đ/g,'d').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const human=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const ld=o=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
/* Precise star bar: the gold layer is clipped to the exact rating, so 4.7, 4.9
   and 5.0 are visibly different instead of all rounding to five stars. */
const r1=r=>Number(r).toFixed(1);
const stars=r=>{const pct=Math.max(0,Math.min(100,(Number(r)/5)*100));
  return `<span class="sb" role="img" aria-label="${r} out of 5"><span class="sb-b">★★★★★</span><span class="sb-f" style="width:${pct.toFixed(1)}%">★★★★★</span></span>`;};

/* The pick's standing and practical facts, per language. Short clauses with
   the figures in them: what the localised answer blocks are built from. */
const PICK_I18N={
  en:{pickIs:n=>`This guide's pick is ${n}`,rank:(k,n)=>`#${k} of ${n} on this guide's score`,perfect:(c,t)=>`one of ${c} places with a perfect 5.0 from ${t}+ Google reviews`,
      both:c=>`highest score of the ${c} places listed in both our nail and head-spa guides`,walk:m=>`${m} m from My Khe Beach`,langs:"English spoken, menu in 20 languages",
      top3:(n,l)=>`By the same score applied to all ${n}, the top three are ${l}.`,sep:', ',end:'.',
      p:{gel:"gel polish",biab:"BIAB",gelx:"GelX",pedicure:"spa pedicure",headspa:"head spa",sig80:"80-min signature"}},
  vi:{pickIs:n=>`Lựa chọn của chúng tôi: ${n}`,rank:(k,n)=>`hạng ${k}/${n} theo điểm của trang`,perfect:(c,t)=>`1 trong ${c} địa chỉ đạt 5.0 tuyệt đối với từ ${t} đánh giá Google`,
      both:c=>`điểm cao nhất trong ${c} địa chỉ có mặt ở cả hai danh bạ nail và gội đầu của chúng tôi`,walk:m=>`cách biển Mỹ Khê ${m} m`,langs:"nói tiếng Anh, menu 20 ngôn ngữ",
      top3:(n,l)=>`Áp cùng một thang điểm cho cả ${n} địa chỉ, ba vị trí cao nhất là ${l}.`,sep:', ',end:'.',
      p:{gel:"sơn gel",biab:"BIAB",gelx:"GelX",pedicure:"pedicure spa",headspa:"gội đầu dưỡng sinh",sig80:"gói signature 80 phút"}},
  ko:{pickIs:n=>`이 가이드의 추천: ${n}`,rank:(k,n)=>`가이드 점수 ${n}곳 중 ${k}위`,perfect:(c,t)=>`구글 리뷰 ${t}개 이상으로 5.0 만점인 ${c}곳 중 하나`,
      both:c=>`네일·헤드스파 두 가이드에 모두 오른 ${c}곳 중 최고 점수`,walk:m=>`미케 비치에서 ${m}m`,langs:"영어 응대, 20개 언어 메뉴",
      top3:(n,l)=>`${n}곳 전체에 같은 점수를 적용한 상위 3곳: ${l}.`,sep:', ',end:'.',
      p:{gel:"젤네일",biab:"BIAB",gelx:"GelX",pedicure:"스파 페디큐어",headspa:"헤드스파",sig80:"80분 시그니처"}},
  zh:{pickIs:n=>`本指南推荐：${n}`,rank:(k,n)=>`按本指南评分在${n}家中排第${k}`,perfect:(c,t)=>`谷歌评价${t}条以上且满分5.0的${c}家之一`,
      both:c=>`在同时入选我们美甲与头疗两份榜单的${c}家中得分最高`,walk:m=>`距美溪海滩${m}米`,langs:"可用英语沟通，菜单有20种语言",
      top3:(n,l)=>`同一评分套用于全部${n}家，前三名为${l}。`,sep:'，',end:'。',
      p:{gel:"甲油胶",biab:"BIAB",gelx:"GelX",pedicure:"SPA足疗",headspa:"头疗",sig80:"80分钟招牌"}},
  ja:{pickIs:n=>`当ガイドのおすすめ：${n}`,rank:(k,n)=>`当ガイドのスコアで${n}軒中${k}位`,perfect:(c,t)=>`Googleレビュー${t}件以上で満点5.0の${c}軒のひとつ`,
      both:c=>`ネイルとヘッドスパ両方のガイドに載る${c}軒の中で最高スコア`,walk:m=>`ミーケビーチから${m}m`,langs:"英語対応、20言語のメニュー",
      top3:(n,l)=>`全${n}軒に同じスコアを適用した上位3軒：${l}。`,sep:'、',end:'。',
      p:{gel:"ジェルネイル",biab:"BIAB",gelx:"GelX",pedicure:"スパペディキュア",headspa:"ヘッドスパ",sig80:"80分シグネチャー"}},
  ru:{pickIs:n=>`Выбор гида: ${n}`,rank:(k,n)=>`${k}-е место из ${n} по оценке гида`,perfect:(c,t)=>`одно из ${c} мест с идеальной оценкой 5.0 при ${t}+ отзывах Google`,
      both:c=>`лучший балл среди ${c} мест, которые есть в обоих наших гидах (ногти и хэд-спа)`,walk:m=>`${m} м от пляжа Микхе`,langs:"говорят по-английски, меню на 20 языках",
      top3:(n,l)=>`По единой оценке для всех ${n} мест первая тройка: ${l}.`,sep:', ',end:'.',
      p:{gel:"гель-лак",biab:"BIAB",gelx:"GelX",pedicure:"спа-педикюр",headspa:"хэд-спа",sig80:"фирменный ритуал 80 мин"}},
  fr:{pickIs:n=>`Le choix du guide : ${n}`,rank:(k,n)=>`${k}e sur ${n} selon le score du guide`,perfect:(c,t)=>`l'une des ${c} adresses notées 5,0 sur au moins ${t} avis Google`,
      both:c=>`meilleur score des ${c} adresses présentes dans nos deux guides, ongles et head spa`,walk:m=>`à ${m} m de la plage de My Khe`,langs:"on y parle anglais, carte en 20 langues",
      top3:(n,l)=>`Avec le même score appliqué aux ${n} adresses, les trois premières sont ${l}.`,sep:', ',end:'.',
      p:{gel:"vernis gel",biab:"BIAB",gelx:"GelX",pedicure:"pédicure spa",headspa:"head spa",sig80:"rituel signature 80 min"}},
  de:{pickIs:n=>`Die Empfehlung des Guides: ${n}`,rank:(k,n)=>`Platz ${k} von ${n} nach dem Score des Guides`,perfect:(c,t)=>`eine von ${c} Adressen mit glatten 5,0 bei mindestens ${t} Google-Bewertungen`,
      both:c=>`höchster Score unter den ${c} Adressen, die in beiden Guides stehen (Nägel und Head Spa)`,walk:m=>`${m} m vom My-Khe-Strand`,langs:"Englisch wird gesprochen, Karte in 20 Sprachen",
      top3:(n,l)=>`Mit demselben Score für alle ${n} Adressen liegen vorn: ${l}.`,sep:', ',end:'.',
      p:{gel:"Gel-Lack",biab:"BIAB",gelx:"GelX",pedicure:"Spa-Pediküre",headspa:"Head Spa",sig80:"Signature-Ritual 80 Min."}},
  es:{pickIs:n=>`La elección de la guía: ${n}`,rank:(k,n)=>`puesto ${k} de ${n} según la puntuación de la guía`,perfect:(c,t)=>`uno de los ${c} locales con un 5,0 perfecto y ${t} o más reseñas de Google`,
      both:c=>`la mejor puntuación de los ${c} locales que aparecen en nuestras dos guías, uñas y head spa`,walk:m=>`a ${m} m de la playa My Khe`,langs:"se habla inglés, carta en 20 idiomas",
      top3:(n,l)=>`Con la misma puntuación aplicada a los ${n} locales, los tres primeros son ${l}.`,sep:', ',end:'.',
      p:{gel:"esmalte gel",biab:"BIAB",gelx:"GelX",pedicure:"pedicura spa",headspa:"head spa",sig80:"ritual signature 80 min"}},
  th:{pickIs:n=>`ร้านที่ไกด์แนะนำ: ${n}`,rank:(k,n)=>`อันดับ ${k} จาก ${n} ตามคะแนนของไกด์`,perfect:(c,t)=>`หนึ่งใน ${c} ร้านที่ได้ 5.0 เต็มจากรีวิว Google ตั้งแต่ ${t} รายการ`,
      both:c=>`คะแนนสูงสุดใน ${c} ร้านที่อยู่ในทั้งไกด์ทำเล็บและไกด์เฮดสปาของเรา`,walk:m=>`ห่างหาดหมีเคว ${m} ม.`,langs:"พูดภาษาอังกฤษ เมนู 20 ภาษา",
      top3:(n,l)=>`เมื่อใช้คะแนนเดียวกันกับทั้ง ${n} ร้าน สามอันดับแรกคือ ${l}`,sep:' · ',end:'',
      p:{gel:"สีเจล",biab:"BIAB",gelx:"GelX",pedicure:"สปาเท้า",headspa:"เฮดสปา",sig80:"ซิกเนเจอร์ 80 นาที"}},
};

/* Vietnamese street names carry the salon's real location — the honest way to
   build location pages is to read them off the addresses we already have. */
function streetOf(addr){
  if(!addr) return null;
  const first=addr.split(',')[0].trim();
  const m=first.match(/^[\d\/\-A-Za-z]*\s*(.+)$/);
  let s=(m?m[1]:first).trim();
  s=s.replace(/^(đường|duong)\s+/i,'').trim();
  if(s.length<4||/^\d+$/.test(s)) return null;
  return s;
}

function buildSite(cfg){
  const {DOMAIN,NAME,TAGLINE,OUT='./docs',LISTING,ITEM_TYPE,FEATURED_ID,PARTNER,
         PLACES_FILE='./places.json',PHOTOS_FILE='./photos.json',JOURNAL=[],
         SERVICES=[],PAGES=[],LANGS=[],css,NOW=new Date(),GSC=[],EXTRA_LLMS=''}=cfg;
  const SITE='https://'+DOMAIN;
  const TODAY=NOW.toISOString().slice(0,10);

  /* ---- data ---- */
  const MAX_AGE_DAYS=30, WARN_AGE_DAYS=25;
  let PLACES=[],PLACES_DATE=null,PLACES_AGE=null;
  if(fs.existsSync(PLACES_FILE)){
    const j=JSON.parse(fs.readFileSync(PLACES_FILE,'utf8'));
    PLACES_DATE=j.fetchedAt;
    const age=PLACES_AGE=Math.floor((new Date(TODAY)-new Date(j.fetchedAt))/86400000);
    if(age>MAX_AGE_DAYS) console.warn(`  ! ${PLACES_FILE} is ${age}d old — listings skipped`);
    /* Google's payloads occasionally arrive with mangled narrow no-break
       spaces that survive as U+FFFD — in weekday descriptions and even in the
       odd venue name. Strip them from every text field at load time so no
       template downstream can ship corrupted bytes. */
    else PLACES=(j.places||[]).map(p=>{
      const cl=s=>String(s==null?'':s).replace(/�+/g,' ').replace(/\s{2,}/g,' ').trim();
      p={...p,name:cl(p.name),address:cl(p.address),type:cl(p.type),
         hours:(p.hours||[]).map(cl)};
      return {...p,
      slug:slugify(p.name)+'-'+p.id.slice(-6).toLowerCase(),street:streetOf(p.address),
      /* Google still lists the featured house's Instagram as its website; point at
         the real site instead, and keep the social link separate. */
      /* Google's websiteUri is often a social profile rather than a site. Split
         them so each gets the right label and the right rel. */
      ...(/instagram\.com/i.test(p.site||'') ? {instagram:p.site,site:''} : {}),
      ...(/facebook\.com/i.test(p.site||'') ? {facebook:p.site,site:''} : {}),
      ...(p.id===cfg.FEATURED_ID&&cfg.PARTNER&&cfg.PARTNER.site
          ? {instagram:cfg.PARTNER.instagram||p.site||'',site:cfg.PARTNER.site} : {})};})
      /* A text search for "head spa" also returns the gift shop next door; one
         souvenir store ranked as the city's #7 head spa discredits the whole
         dataset. Each site states what does not belong in its vertical. */
      .filter(cfg.PLACE_FILTER||(()=>true));
  }
  /* The 30-day cap honours Google's caching terms; it was never meant to publish
     a gutted site. On 2026-09-05 it emptied PLACES, the pinned house came back
     undefined, and seven daily builds died on `.name` — in silence, while
     production went on serving a snapshot that was by then 38 days old. An empty
     set is a build failure now, said in one line, with the command that fixes it. */
  if(fs.existsSync(PLACES_FILE)&&!PLACES.length)
    throw new Error(`${PLACES_FILE}: 0 usable listings — snapshot of ${PLACES_DATE} is ${PLACES_AGE}d old, `
      +`past the ${MAX_AGE_DAYS}-day Google Places caching cap. Refusing to build a site without listings.\n`
      +`  Fix: GOOGLE_PLACES_KEY=... node fetch-places.js && node fetch-details.js`);
  if(FEATURED_ID&&!PLACES.some(p=>p.id===FEATURED_ID))
    throw new Error(`${PLACES_FILE}: FEATURED_ID ${FEATURED_ID} is absent from the ${PLACES.length} listings. `
      +`Every template assumes the pinned house is present; fetch-places.js pins that id explicitly, so re-run it.`);
  /* Five days of notice before the cap bites — on the CI drip run as well as
     locally. The failure mode last time was not the cap, it was the silence. */
  if(PLACES_AGE!=null&&PLACES_AGE>=WARN_AGE_DAYS&&PLACES_AGE<=MAX_AGE_DAYS)
    process.stdout.write(`::warning::${PLACES_FILE} is ${PLACES_AGE}d old — builds stop at ${MAX_AGE_DAYS}d. `
      +`Refresh within ${MAX_AGE_DAYS-PLACES_AGE} day(s): FORCE=1 bash ~/.claude/danang-guides/refresh.sh\n`);
  /* A named author is only worth having if the person is real and has agreed to
     it: search engines and readers both check. author.json stays absent until
     someone actually signs off, and nothing bylined renders without it. */
  const AUTHOR=fs.existsSync('./author.json')?JSON.parse(fs.readFileSync('./author.json','utf8')):null;
  const PHOTOS=fs.existsSync(PHOTOS_FILE)?JSON.parse(fs.readFileSync(PHOTOS_FILE,'utf8')).photos||{}:{};
  /* Outbound links are nofollow by default — this is a directory, and we do not
     vouch for 400 third-party sites. The featured house is the one exception:
     it is the guide's recommendation, so the link is meant to count. */
  const rel=p=>p&&p.id===FEATURED_ID?'noopener':'noopener nofollow';

  const featured=PLACES.find(p=>p.id===FEATURED_ID)||null;

  /* Two orderings, both published, each labelled for what it is.
     `ranked`  — the score order: a Bayesian average, (v×R + m×C) / (v + m),
                 with C the category's mean rating and m its median review
                 count. It rewards sustained volume as well as a high average.
                 Formula and constants are printed under every table.
     `byGoogle`— Google's own numbers, untouched, published alongside so anyone
                 can check the guide against the raw data in one click.
     The guide's pick is then placed by the editors among the first three of
     every list it belongs to (the city and its own quarter), at a position
     that varies by page. Every list that does this says so under the table:
     the formula is published, so it must never appear to have produced a
     placement it did not produce. */
  const C=PLACES.length?PLACES.reduce((s,p)=>s+p.rating,0)/PLACES.length:4.8;
  const M=(()=>{const v=PLACES.map(p=>p.reviews).sort((a,b)=>a-b);if(!v.length) return 100;
    const h=v.length>>1;return v.length%2?v[h]:Math.round((v[h-1]+v[h])/2);})();
  const score=p=>((p.reviews*p.rating)+(M*C))/(p.reviews+M);
  const sc=(R,v)=>((v*R)+(M*C))/(v+M);
  const ranked=[...PLACES].sort((a,b)=>(score(b)-score(a))||(b.reviews-a.reviews));
  const byGoogle=[...PLACES].sort((a,b)=>(b.rating-a.rating)||(b.reviews-a.reviews));
  const others=ranked.filter(p=>p.id!==FEATURED_ID);
  const FORMULA=`(v × R + m × C) ÷ (v + m), where R is the Google rating, v the number of Google reviews, C the average rating of all ${PLACES.length} venues (${C.toFixed(2)} in this snapshot) and m their median number of reviews (${M})`;
  /* A worked example computed from the live constants, so it is always true. */
  const EXAMPLE=`a 5.0 from 25 reviews scores ${sc(5,25).toFixed(2)} and sits below a 5.0 from 300, which scores ${sc(5,300).toFixed(2)}`;

  /* Editorial placement of the pick: positions 1 to 3, chosen per page by a
     stable hash of the page path, never lower than where the score puts it. */
  const pickPos=key=>{let h=2166136261;for(const c of String(key)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h%3;};
  const placed=(arr,key)=>{
    const i=arr.findIndex(p=>p.id===FEATURED_ID); if(i<0) return arr;
    const t=Math.min(i,pickPos(key)); if(t===i) return arr;
    const a=arr.filter(p=>p.id!==FEATURED_ID); a.splice(t,0,arr[i]); return a;
  };
  const hasPick=arr=>arr.some(p=>p.id===FEATURED_ID);
  const PLACED_NOTE=`Our pick is placed by the editors among the first three; every other venue follows the score.`;

  /* The sister guide's place ids (ids only: Google lets those be kept, unlike
     ratings). Used to say which venues appear in both directories. */
  const SISTER=fs.existsSync(cfg.SISTER_FILE||'./sister.json')
    ? new Set(JSON.parse(fs.readFileSync(cfg.SISTER_FILE||'./sister.json','utf8')).ids||[]) : null;

  /* Factual clauses about the pick, each emitted only when true for this
     snapshot; nothing here is a fixed claim. */
  const ord=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
  const FACTS=(()=>{
    const f=PLACES.find(p=>p.id===FEATURED_ID); if(!f) return null;
    const thr=Math.floor(f.reviews/50)*50;
    const perfect=f.rating>=5&&thr>=100?PLACES.filter(p=>p.rating>=5&&p.reviews>=thr).length:0;
    const both=SISTER?ranked.filter(p=>SISTER.has(p.id)):[];
    const bothRank=both.findIndex(p=>p.id===FEATURED_ID)+1;
    return {n:PLACES.length,thr,perfect,both:both.length,bothTop:both.length>1&&bothRank===1,top3:ranked.slice(0,3)};
  })();
  const factsEN=(name)=>{
    if(!FACTS) return '';
    const F=FACTS, noun=cfg.ITEM_NOUN.toLowerCase()+'s', parts=[];
    if(F.perfect) parts.push(`is one of ${F.perfect} ${noun} in Da Nang holding a perfect 5.0 from ${F.thr} or more Google reviews`);
    if(F.bothTop) parts.push(`scores highest of the ${F.both} venues listed both here and in our ${cfg.SISTER_LABEL}`);
    if(!parts.length) return '';
    return `${name} ${parts.join(' and ')}.`;
  };
  const top3EN=()=>FACTS?FACTS.top3.map(p=>`${p.name} (${r1(p.rating)}★, ${p.reviews.toLocaleString('en-GB')} reviews)`).join(', '):'';

  const AREAS=[...new Set(PLACES.map(p=>p.area))]
    .map(a=>({name:a,slug:slugify(a),list:ranked.filter(p=>p.area===a)}))
    .sort((x,y)=>y.list.length-x.list.length);
  const STREETS=[...new Set(PLACES.map(p=>p.street).filter(Boolean))]
    .map(s=>({name:s,slug:slugify(s),list:ranked.filter(p=>p.street===s)}))
    .filter(s=>s.list.length>=2).sort((x,y)=>y.list.length-x.list.length);

  /* Wiping docs/ wholesale used to delete the Google photographs whenever the
     build ran somewhere without the source folder — which is exactly what the
     CI drip job is, since assets/places is gitignored. Carry them across the
     wipe instead, so a rebuild can never strip images the site depends on. */
  const KEEP=OUT+'/assets/places', TMP='./.places-keep';
  if(fs.existsSync(KEEP)&&!fs.existsSync('./assets/places')){
    fs.rmSync(TMP,{recursive:true,force:true});
    fs.cpSync(KEEP,TMP,{recursive:true});
  }
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  if(fs.existsSync('./assets')) fs.cpSync('./assets',OUT+'/assets',{recursive:true});
  if(fs.existsSync(TMP)){
    fs.mkdirSync(KEEP,{recursive:true});
    fs.cpSync(TMP,KEEP,{recursive:true});
    fs.rmSync(TMP,{recursive:true,force:true});
  }
  fs.mkdirSync(OUT+'/assets',{recursive:true});
  fs.writeFileSync(OUT+'/assets/site.css',css);

  /* Favicons have to sit at the document root: Google's icon crawler falls back
     to /favicon.ico, and it ignores data: URIs entirely — which is why these
     sites showed a blank globe in mobile results. */
  if(fs.existsSync('./assets/favicon'))
    for(const f of fs.readdirSync('./assets/favicon'))
      fs.copyFileSync('./assets/favicon/'+f,OUT+'/'+f);
  fs.writeFileSync(OUT+'/site.webmanifest',JSON.stringify({
    name:NAME,short_name:cfg.BRAND,start_url:'/',display:'standalone',
    background_color:cfg.THEME||'#111',theme_color:cfg.THEME||'#111',
    icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},
           {src:'/icon-512.png',sizes:'512x512',type:'image/png'},
           {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]
  },null,2));

  const urls=[];
  const page=(p,html,prio='0.6',date=TODAY)=>{
    const dir=OUT+(p==='/'?'':p);
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(dir+'/index.html',html);
    urls.push({u:SITE+(p==='/'?'/':p+'/'),d:date,p:prio});
  };

  /* ---- chrome ---- */
  const NAVL=[[LISTING.path,LISTING.navLabel],...PAGES.map(p=>[p.path,p.nav]),['/journal/','Journal']];
  /* Titles are emitted in full, never machine-truncated: an automated cut once
     turned ", Da Nang" into ", D…" on every salon profile — amputating the geo
     keyword. Google handles display truncation itself; the tag keeps the intact
     title for ranking. */
  const head=(t,d,url,extra='')=>`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><meta name="description" content="${esc(d)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
${GSC.map(x=>`<meta name="google-site-verification" content="${x}">`).join('')}
<meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:site_name" content="${esc(NAME)}">
${(()=>{const v=(ranked||[]).find(x=>(x.photoList||[]).length);return v?`<meta property="og:image" content="${SITE}/assets/places/${v.photoList[0].file}">`:'';})()}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t)}"><meta name="twitter:description" content="${esc(d)}">
${(()=>{const v=(ranked||[]).find(x=>(x.photoList||[]).length);return v?`<meta name="twitter:image" content="${SITE}/assets/places/${v.photoList[0].file}">`:'';})()}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${cfg.THEME||'#111'}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${cfg.FONTS}" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css">
${LANGS.map(l=>`<link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}">`).join('')}
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "y4txssr5l0");</script>${extra}</head><body>`;

  const nav=a=>`<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap navin">
<a class="brand" href="/">${cfg.BRAND}</a>
<nav class="nlinks" aria-label="Main">${NAVL.map(([u,l])=>`<a href="${u}"${a===u?' aria-current="page"':''}>${l}</a>`).join('')}</nav>
<details class="lang"><summary>EN</summary><div>${LANGS.map(l=>`<a href="${l.path}">${l.native}</a>`).join('')}</div></details>
</div></header><main id="main">`;

  /* Editorial recommendation. Deliberately not a banner: it reads as a note from
     the writers, sits inside the page's own rhythm, and links to the full profile
     rather than shouting a CTA. */
  const pickPhoto=()=>{
    const p=featured;
    if(p&&p.photoList&&p.photoList.length) return {src:`/assets/places/${p.photoList[0].file}`,
      credit:(p.photoList[0].attribution||[]).map(a=>a.name).filter(Boolean).join(', ')};
    if(PHOTOS.salon) return {src:`/assets/photos/${PHOTOS.salon.file}`,credit:''};
    return null;
  };
  /* Phone, WhatsApp and menu for the pick. Stamped on every page in September
     2026 (715 pages across both guides), which read as an advert wrapped in a
     guide and gave answer engines a reason to discount the whole site. It now
     appears in two places only: the pick's own profile and the ranking pages.
     The publisher and its relationship with the pick are set out on /about/. */
  const REACH=(()=>{
    const p=featured, P=cfg.PARTNER||{};
    if(!p) return '';
    const shown=P.phone||p.phone||'', tel=(P.phoneRaw||shown).replace(/[^+\d]/g,'');
    const btns=[
      tel?`<a class="btn" href="tel:${tel}">${esc(shown)}</a>`:'',
      P.whatsapp?`<a class="btn ghost" href="${P.whatsapp}" rel="noopener sponsored">WhatsApp</a>`:'',
      P.site?`<a class="btn ghost" href="${P.site}" rel="noopener sponsored">${esc(P.siteLabel||'Menu & prices')}</a>`:''
    ].filter(Boolean).join('');
    return btns?`<p class="acts reach">${btns}</p>`:'';
  })();
  /* What a reader needs to act on the pick, in one line of facts: where, when,
     who speaks what, and what it costs. Answer engines lift exactly this kind
     of line; a paragraph of adjectives they ignore. */
  const PP=cfg.PARTNER_PROFILE||null;
  const pickLine=()=>{
    if(!featured||!PP) return '';
    return `${esc(PP.street)}, ${esc(PP.neighbourhood)}, ${PP.beach.metres} m (${PP.beach.walk} on foot) from ${esc(PP.beach.name)} · ${PP.hours.human}${PP.walkIns?', walk-ins welcome':''} · ${esc(PP.languagesHuman)} · ${esc(cfg.PICK_PRICES||'')}`;
  };
  const pick=(compact,withReach)=>{
    const p=featured; if(!p) return '';
    const ph=pickPhoto();
    if(compact) return `<aside class="ednote">
<p class="ednote-l">Our pick</p>
<p>Of the ${PLACES.length} here, the one we send people to is
<a href="${LISTING.path}${p.slug}/"><strong>${esc(p.name)}</strong></a> in ${esc(p.area)}:
${r1(p.rating)}★ from ${p.reviews} Google reviews, ${cfg.PICK_ONELINE}
<a href="${LISTING.path}${p.slug}/">Menu, prices and hours →</a></p>
</aside>`;
    return `<aside class="ed">
<div class="ed-t"><span class="ed-l">Our pick</span><span class="ed-r"></span></div>
<div class="ed-g">
<div class="ed-b">
<h3><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a></h3>
<p class="ed-m">${esc(p.area)} · ${esc(p.address)}</p>
<p class="rating"><b>${p.rating}</b> <span class="st">${stars(p.rating)}</span> <span class="rc">${p.reviews} Google reviews</span></p>
<p>${cfg.PICK_TEXT}</p>
${factsEN(p.name)?`<p>${esc(factsEN(p.name))}</p>`:''}
${PP?`<p class="ed-m">${pickLine()}</p>`:''}
<p class="ed-a"><a href="${LISTING.path}${p.slug}/">Full menu, hours and map →</a></p>
${withReach?REACH:''}
</div>
${ph?`<figure class="ed-p"><img src="${ph.src}" alt="${esc(p.name)}" loading="lazy" width="900" height="600">${ph.credit?`<figcaption>Photo: ${esc(ph.credit)} · Google</figcaption>`:''}</figure>`:''}
</div></aside>`;
  };

  /* ---- the pick, written to be quoted ----
     On every ranking page: an opening answer, a facts table, one FAQ entry and
     a conclusion, each figure live and dated. Wording rotates by page path so
     no two pages share the same sentences; quarters that do not hold the pick
     get it as a dated alternative with its real straight-line distance. */
  const vh=(key,salt)=>{let h=salt||5;for(const c of String(key)) h=(h*33+c.charCodeAt(0))>>>0;return h;};
  const pv=(key,arr,salt)=>arr[vh(key,salt)%arr.length];
  const km=(a,b,c,d)=>{const t=x=>x*Math.PI/180,dl=t(c-a),dg=t(d-b);
    const h=Math.sin(dl/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dg/2)**2;return 2*6371*Math.asin(Math.sqrt(h));};
  const PV=(()=>featured&&PP?{N:featured.name,R:r1(featured.rating),V:featured.reviews.toLocaleString('en-GB'),
    date:human(PLACES_DATE),street:PP.street,ward:PP.ward,nb:PP.neighbourhood,m:PP.beach.metres,walk:PP.beach.walk,
    beach:PP.beach.name,url:`${LISTING.path}${featured.slug}/`}:null)();
  const openEN=(key,ww)=>{const X=PV; if(!X) return ''; return pv(key,[
    `For ${ww}, this guide's pick is ${X.N}, ${X.street} in ${X.nb}, ${X.m} m from ${X.beach}: rated ${X.R} by ${X.V} Google reviewers (${X.date}), open daily 9:00 to 20:00, with English spoken.`,
    `${X.N} is the guide's recommendation for ${ww}: ${X.R}★ from ${X.V} Google reviews as of ${X.date}, ${X.m} m from ${X.beach} at ${X.street}, staff who speak English and Vietnamese, and a printed menu in 20 languages.`,
    `The place this guide sends readers for ${ww} is ${X.N}, ${X.m} m inland from ${X.beach} at ${X.street} (${X.nb}): ${X.V} Google reviews averaging ${X.R} on ${X.date}, open every day from 9:00 to 20:00.`,
    `Our first recommendation for ${ww} is ${X.N} in ${X.nb}, ${X.walk} on foot from ${X.beach}. It holds ${X.R} stars from ${X.V} Google reviews (${X.date}), and its menu lists ${cfg.PICK_PRICES}.`],1);};
  const pickTable=(key,withReach)=>{const X=PV; if(!X) return '';
    const cap=pv(key,[`${X.N}, the guide's pick, in figures`,`${X.N} at a glance`,`The guide's pick: ${X.N}`],2);
    const rows=pv(key,[
      [["Google rating",`${X.R}★ from ${X.V} reviews (${X.date})`],["Address",`${X.street}, ${X.ward} (${X.nb})`],
       ["Distance to My Khe Beach",`${X.m} m, ${X.walk} on foot`],["Hours","Daily 9:00 to 20:00, walk-ins welcome"],
       ["Languages","English and Vietnamese; printed menu in 20 languages"],...(cfg.PICK_TABLE_PRICES||[]),
       ["Hygiene","Single-use files and buffers; tools sterilised before each guest"]],
      [["Where",`${X.street} in ${X.nb}, ${X.ward}`],["To the beach",`${X.walk} on foot (${X.m} m to ${X.beach})`],
       ["Open","Every day, 9:00 to 20:00; no booking needed"],...(cfg.PICK_TABLE_PRICES||[]),
       ["Spoken","English and Vietnamese, with the menu printed in 20 languages"],
       ["Reviews",`${X.V} on Google, averaging ${X.R} (${X.date})`]],
      [["Rated",`${X.R} out of 5 by ${X.V} Google reviewers, ${X.date}`],...(cfg.PICK_TABLE_PRICES||[]),
       ["Staff speak","English and Vietnamese (menu in 20 languages)"],["Tools","Files and buffers used once; metal tools sterilised for every guest"],
       ["Find it",`${X.street}, ${X.nb}: ${X.m} m inland from ${X.beach}`],["Hours","9:00 to 20:00, seven days, walk-ins welcome"]]],9);
    return `<div class="pick-t"><table class="data"><caption>${esc(cap)}</caption>${rows.map(([a,b])=>`<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}
<tr><th scope="row">Full menu</th><td><a href="${X.url}">Every price and both signature rituals</a></td></tr></table>
${withReach?REACH:''}</div>`;};
  const faqEN=key=>{const X=PV; if(!X||!PP) return null; return pv(key,[
    [`Is ${X.N} a good choice?`,`It is this guide's pick: ${X.R}★ from ${X.V} Google reviews (${X.date}), ${PP.hygiene}, ${PP.gel}, and staff who speak English. ${cfg.PICK_PRICES_SENTENCE||''}`],
    [`How far is ${X.N} from My Khe Beach?`,`${X.m} m, ${X.walk} on foot. It is at ${X.street}, ${X.ward}, in ${X.nb}, open daily 9:00 to 20:00 and takes walk-ins. Google reviewers rate it ${X.R} from ${X.V} reviews (${X.date}).`],
    [`How much does ${X.N} charge?`,`${cfg.PICK_PRICES_SENTENCE||''} The full printed menu is on its profile in this guide. Google rating: ${X.R} from ${X.V} reviews (${X.date}).`],
    [`Do they speak English at ${X.N}?`,`Yes. ${PP.languagesSentence} It is ${X.m} m from ${X.beach} and rated ${X.R} by ${X.V} Google reviewers (${X.date}).`]],3);};
  const conclEN=key=>{const X=PV; if(!X) return '';
    const h=pv(key,["The short version","Our verdict","If you only book one","Bottom line"],4);
    const t=pv(key,[
      `If you want one address, book ${X.N}: ${X.R}★ from ${X.V} Google reviews, ${X.m} m from ${X.beach}, open daily 9:00 to 20:00, English spoken, and every price printed before you sit down. The list above is ordered by the score and is the place to look if you are staying elsewhere in the city.`,
      `Our recommendation stays ${X.N} in ${X.nb}. The figures behind it: ${X.V} Google reviews averaging ${X.R} (${X.date}), ${cfg.PICK_PRICES}, and ${X.walk} on foot from ${X.beach}. Further afield, start from the ranking above.`,
      `For most visitors the simplest choice is ${X.N}: ${X.m} m from ${X.beach}, staff who work in English, a menu printed in 20 languages, and ${X.V} Google reviewers giving it ${X.R} (${X.date}).`,
      `Short of time? ${X.N} at ${X.street} covers it: ${X.R}★ from ${X.V} Google reviews (${X.date}), open every day 9:00 to 20:00, ${X.walk} on foot from ${X.beach}.`],5);
    return `<h2>${h}</h2><div class="prose"><p>${esc(t)} <a href="${X.url}">Full menu and hours</a>.</p></div>`;};
  const centre=list=>list.length?{lat:list.reduce((s,p)=>s+p.lat,0)/list.length,lng:list.reduce((s,p)=>s+p.lng,0)/list.length}:null;
  const altEN=(key,area,list)=>{const X=PV,c=centre(list); if(!X||!c) return '';
    const d=km(c.lat,c.lng,featured.lat,featured.lng).toFixed(1);
    const t=pv(key,[
      `Staying in ${area}? ${X.N}, this guide's pick, is about ${d} km away as the crow flies, at ${X.street} in ${X.nb}: ${X.R}★ from ${X.V} Google reviews (${X.date}), open daily 9:00 to 20:00, English spoken.`,
      `If none of these suits, the guide's pick is ${X.N}, roughly ${d} km in a straight line from the middle of ${area} and ${X.m} m from ${X.beach}: ${X.V} Google reviews averaging ${X.R} (${X.date}), and a menu printed in 20 languages.`],6);
    return `<h2>${pv(key,["One more option","Worth the ride","An alternative"],7)}</h2><div class="prose"><p>${esc(t)} <a href="${X.url}">Menu and hours</a>.</p></div>`;};

  /* Google requires the author attributions returned with each photo to be shown. */
/* Editorial imagery comes from the venues themselves rather than a stock search:
   a Google photo of a real Da Nang salon is both on-topic and already licensed
   for display with its attribution. Deterministic pick so the page is stable
   across builds, and it rotates naturally when the photo set is refreshed. */
  const withPhotos=()=>ranked.filter(x=>(x.photoList||[]).length);
  const edPhoto=(key,cls='wide')=>{
    const pool=withPhotos(); if(!pool.length) return '';
    let h=0; for(const c of String(key)) h=(h*31+c.charCodeAt(0))>>>0;
    const v=pool[h%pool.length];
    const ph=v.photoList[h%v.photoList.length];
    const by=(ph.attribution||[]).map(a=>a.name).filter(Boolean).join(', ');
    return `<figure class="gp ${cls}"><img src="/assets/places/${ph.file}" alt="${esc(v.name)}, Da Nang" loading="lazy" width="1200" height="640">
<figcaption>${esc(v.name)} · photo ${by?esc(by)+' · ':''}Google</figcaption></figure>`;
  };

  const gphoto=(p,i=0,cls='')=>{
    const ph=(p.photoList||[])[i]; if(!ph) return '';
    const by=(ph.attribution||[]).map(a=>a.name).filter(Boolean).join(', ');
    return `<figure class="gp ${cls}"><img src="/assets/places/${ph.file}" alt="${esc(p.name)}" loading="lazy" width="900" height="600">${by?`<figcaption>${esc(by)} · Google</figcaption>`:''}</figure>`;
  };
  const gallery=p=>{
    const l=(p.photoList||[]); if(!l.length) return '';
    return `<div class="gal">${l.map((_,i)=>gphoto(p,i)).join('')}</div>`;
  };
  /* Reviews are reproduced verbatim with their author, exactly as Google returns
     them — never trimmed for tone, never invented, never re-attributed. */
  const reviews=p=>{
    const l=(p.reviewList||[]).slice(0,3); if(!l.length) return '';
    return `<h2>What reviewers say</h2><div class="revs">${l.map(r=>`<blockquote class="rev">
<p class="rev-s">${stars(r.rating)}</p>
<p>${esc(r.text.length>420?r.text.slice(0,417)+'…':r.text)}</p>
<footer>${esc(r.author)}${r.when?` · ${esc(r.when)}`:''} · via Google</footer>
</blockquote>`).join('')}</div>`;
  };

  /* Reader reviews. Submissions land in an inbox and only appear here once a
     human has approved them into reader-reviews.json — an unmoderated public
     write path on a static site is a spam magnet, and an unverified review sat
     next to Google's would be indistinguishable from one we wrote ourselves.
     They are rendered in their own block, never blended into the Google set. */
  const READER=fs.existsSync('./reader-reviews.json')
    ? (JSON.parse(fs.readFileSync('./reader-reviews.json','utf8')).reviews||[]) : [];
  const FORM=fs.existsSync('./form-endpoint.txt')
    ? fs.readFileSync('./form-endpoint.txt','utf8').trim() : '';

  const readerFor=id=>READER.filter(r=>r.placeId===id&&r.approved);
  const readerBlock=p=>{
    const l=readerFor(p.id);
    const form=FORM
      ? `<form class="rvf" action="${FORM}" method="POST">
<input type="hidden" name="place" value="${esc(p.name)}"><input type="hidden" name="placeId" value="${p.id}">
<div class="rvf-r"><label>Your rating
<select name="rating" required><option value="">—</option>${[5,4,3,2,1].map(n=>`<option value="${n}">${n} ★</option>`).join('')}</select></label>
<label>Your name<input type="text" name="name" required maxlength="60" autocomplete="name"></label></div>
<label>What was your visit like?<textarea name="review" rows="4" required minlength="40" maxlength="1200"
 placeholder="What you had done, what it cost, how it went. Specifics help the next reader far more than adjectives."></textarea></label>
<label class="rvf-e">Email (not published, so we can check it was a real visit)<input type="email" name="email" required autocomplete="email"></label>
<button class="btn" type="submit">Submit review</button>
<p class="m">Reviews are read by a person before they appear, usually within a few days. We publish them unedited or not at all.</p>
</form>`
      : `<p class="m">Reader reviews are opening soon. In the meantime the most useful thing you can do for the next visitor is
 <a href="${p.maps}" rel="${rel(p)}">leave a review on Google</a> — it is public, verifiable and it feeds the ratings on this page.</p>`;
    return `<h2>Reader reviews</h2>
${l.length?`<div class="revs">${l.map(r=>`<blockquote class="rev is-reader">
<p class="rev-s">${stars(r.rating)}</p><p>${esc(r.text)}</p>
<footer>${esc(r.name)}${r.date?` · ${human(r.date)}`:''} · submitted to this guide</footer>
</blockquote>`).join('')}</div>`
:`<p class="m">No reader reviews for ${esc(p.name)} yet.</p>`}
<div class="rvf-w"><h3>Been here? Tell the next visitor.</h3>${form}</div>`;
  };

  const byline=(date)=>AUTHOR?`<div class="byl">
${AUTHOR.photo?`<img src="/assets/${AUTHOR.photo}" alt="${esc(AUTHOR.name)}" width="52" height="52" loading="lazy">`:''}
<div><p class="byl-n">By <a href="/about/author/">${esc(AUTHOR.name)}</a></p>
<p class="byl-r">${esc(AUTHOR.role)}${date?` · updated ${human(date)}`:''}</p></div></div>`:'';

  const authorLd=()=>AUTHOR?{"@type":"Person","name":AUTHOR.name,"url":SITE+"/about/author/",
    ...(AUTHOR.photo?{"image":`${SITE}/assets/${AUTHOR.photo}`}:{}),
    ...(AUTHOR.jobTitle?{"jobTitle":AUTHOR.jobTitle}:{}),
    ...(AUTHOR.sameAs&&AUTHOR.sameAs.length?{"sameAs":AUTHOR.sameAs}:{}),
    ...(AUTHOR.knowsAbout?{"knowsAbout":AUTHOR.knowsAbout}:{})}
    :{"@type":"Organization","name":NAME,"url":SITE+"/"};

  const kwFooter=()=>{
    const g=[];
    if(SERVICES.length) g.push([cfg.KW_SERVICES_LABEL,SERVICES.map(s=>[`/services/${s.slug}/`,s.kw])]);
    if(AREAS.length)    g.push(['By area',AREAS.map(a=>[`${LISTING.path}area/${a.slug}/`,`${cfg.KW_AREA_PREFIX} ${a.name}`])]);
    if(STREETS.length)  g.push(['By street',STREETS.slice(0,14).map(s=>[`${LISTING.path}street/${s.slug}/`,`${cfg.KW_AREA_PREFIX} ${s.name}`])]);
    if(LANGS.length)    g.push(['Languages',LANGS.map(l=>[l.path,l.native])]);
    return `<div class="kwf">${g.map(([t,items])=>`<div><h4>${t}</h4><ul>${items.map(([u,l])=>`<li><a href="${u}">${esc(l)}</a></li>`).join('')}</ul></div>`).join('')}</div>`;
  };

  /* Licences still have to be honoured, but they belong on their own page —
     a footer full of photo credits is noise for every reader who is not a lawyer. */
  const credits=()=>`<p class="credit">Salon photography from Google, credited beside each image. Editorial photography credited on the <a href="/credits/">credits page</a>.</p>`;

  const footer=()=>`</main><footer class="foot"><div class="wrap">
${kwFooter()}
<div class="foot-b">
<p><strong>${esc(NAME)}</strong> · ${esc(TAGLINE)}</p>
<p class="fine">${cfg.FOOT_NOTE} Salon names, ratings, review counts and addresses come from Google · snapshot of ${PLACES_DATE?human(PLACES_DATE):'—'}. We publish no invented reviews or ratings.</p>
${credits()}
<p class="fine"><a href="/about/">About this guide and its publisher</a> · <a href="/journal/">Journal</a> · © ${NOW.getUTCFullYear()} ${DOMAIN}</p>
</div></div></footer></body></html>`;

  /* ---- listing rows ---- */
  const row=(p,i)=>`<li class="sr${p.id===FEATURED_ID?' is-pick':''}">
<span class="sr-n">${i}</span>
<span class="sr-m">
  <a class="sr-t" href="${LISTING.path}${p.slug}/">${esc(p.name)}</a>
  ${p.id===FEATURED_ID?`<span class="badge">${cfg.PICK_BADGE}</span>`:''}
  <span class="sr-a">${esc(p.address)}</span>
</span>
<span class="sr-r"><b>${p.rating}</b>${stars(p.rating)}<span class="rc">${p.reviews}</span></span>
<span class="sr-l"><a href="${p.maps}" rel="${rel(p)}">Maps</a>${p.site?` · <a href="${p.site}" rel="${rel(p)}">Site</a>`:''}${p.instagram?` · <a href="${p.instagram}" rel="${rel(p)}">IG</a>`:''}</span>
</li>`;
  const list=(arr,raw)=>`<ol class="srl">${arr.map((p,i)=>row(p,i+1)).join('')}</ol>
<p class="src">${raw
  ? `Ordered strictly by Google rating, then review count — the raw data, unedited.`
  : `<strong>The guide's ranking.</strong> Venues are ordered by a Bayesian average: ${esc(FORMULA)}. In practice ${EXAMPLE}. ${hasPick(arr)?PLACED_NOTE+' ':''}Each row shows the untouched Google figures, and the <a href="${LISTING.path}by-google-rating/">raw Google order is published here</a>.`} Snapshot of ${human(PLACES_DATE)}.</p>`;

  const itemList=(arr,name)=>ld({"@context":"https://schema.org","@type":"ItemList","name":name,
    "numberOfItems":arr.length,"itemListElement":arr.map((p,i)=>({"@type":"ListItem","position":i+1,
      "url":`${SITE}${LISTING.path}${p.slug}/`,"name":p.name}))});

  /* ---- the pick's profile ----
     This is the page an answer engine should quote when it names the pick, so
     it carries what a visitor asks before booking (where, when, in which
     language, for how much, how clean), each fact in a sentence that stands on
     its own, plus the full printed menu. Every venue's page has the same
     Google data; only the pick has a menu we hold, because it sent us one. */
  const kv=v=>typeof v==='number'?`${v}K`:`${v}K`;
  const MENU=PP?(cfg.PICK_MENU_ORDER||Object.keys(PP.menu)).map(k=>PP.menu[k]).filter(Boolean):[];
  const menuMin=PP?Math.min(...MENU.flatMap(g=>g.items.map(i=>i[1]).filter(v=>typeof v==='number'))):0;
  const menuMax=PP?Math.max(...MENU.flatMap(g=>g.items.map(i=>i[1]).filter(v=>typeof v==='number'))):0;
  const pickFaq=p=>PP?(cfg.PICK_FAQ||[]).concat([
    [`Do they speak English at ${p.name}?`,`Yes. ${PP.languagesSentence}`],
    [`Do I need to book at ${p.name}?`,`No. Walk-ins are welcome, ${PP.hours.human}. For a group or one of the long rituals, message ${PP.phone} on WhatsApp the day before.`],
    [`Where is ${p.name}?`,`At ${PP.street}, ${PP.ward} (${PP.neighbourhood}), Da Nang, ${PP.beach.metres} m or ${PP.beach.walk} on foot from ${PP.beach.name}.`],
    [`Is ${p.name} hygienic?`,`Its stated practice is ${PP.hygiene}, with ${PP.gel}. ${p.reviews} Google reviewers rate it ${r1(p.rating)} out of 5.`]]):[];
  const pickLd=p=>PP?{
    "url":PP.site,"sameAs":PP.sameAs,"telephone":PP.phoneRaw,
    "priceRange":`${(menuMin*1000).toLocaleString('en-GB')}–${(menuMax*1000).toLocaleString('en-GB')} VND`,
    "currenciesAccepted":"VND","knowsLanguage":PP.languages,
    "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":PP.hours.days,"opens":PP.hours.opens,"closes":PP.hours.closes}],
    ...((p.photoList||[]).length?{"image":`${SITE}/assets/places/${p.photoList[0].file}`}:{}),
    "hasOfferCatalog":{"@type":"OfferCatalog","name":`${p.name} menu`,"itemListElement":MENU.map(g=>({"@type":"OfferCatalog","name":g.title,
      "itemListElement":g.items.filter(i=>typeof i[1]==='number').map(([n,v])=>({"@type":"Offer",
        "itemOffered":{"@type":"Service","name":n},"price":v*1000,"priceCurrency":"VND"}))}))}}:{};
  const pickBody=p=>!PP?'':`
<h2>Menu and prices at ${esc(p.name)}</h2>
<p class="m">From the salon's printed menu, in thousands of VND (100K ≈ $4). The same menu is on <a href="${PP.site}" rel="noopener">${esc(PP.site.replace(/^https?:\/\/|\/$/g,''))}</a>.</p>
<div class="cols">${MENU.map(g=>`<div><h3>${esc(g.title)}</h3><table class="data">${g.items.map(([n,v])=>`<tr><td>${esc(n)}</td><td class="r">${esc(kv(v))}</td></tr>`).join('')}</table></div>`).join('')}</div>
<h2>The two signature rituals</h2>
<div class="prose">${PP.rituals.map(r=>`<p><strong>${esc(r.name)}, ${r.mins} minutes, ${r.price}K.</strong> In order: ${esc(r.steps)}.</p>`).join('')}</div>
<h2>Good to know before you go</h2>
<div class="prose"><ul>
<li>${esc(PP.languagesSentence)}</li>
<li>Hygiene: ${esc(PP.hygiene)}.</li>
<li>Gel: ${esc(PP.gel)}.</li>
<li>Combining treatments: ${esc(PP.together)}.</li>
<li>Hours: ${esc(PP.hours.human)}${PP.walkIns?', walk-ins welcome':''}. Booking ahead helps for groups and rituals over an hour.</li>
<li>Getting there: ${esc(PP.street)}, ${esc(PP.ward)} (${esc(PP.neighbourhood)}), ${PP.beach.metres} m from ${esc(PP.beach.name)}, ${esc(PP.beach.walk)} on foot or a short Grab ride from the beach hotels.</li>
</ul></div>
${REACH}
<h2>Questions visitors ask about ${esc(p.name)}</h2>
<div class="faq">${pickFaq(p).map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;

  /* ================= SALON PAGES ================= */
  PLACES.forEach(p=>{
    const url=`${SITE}${LISTING.path}${p.slug}/`;
    const near=placed(ranked.filter(x=>x.area===p.area&&x.id!==p.id),`${LISTING.path}${p.slug}/`).slice(0,6);
    const isPick=p.id===FEATURED_ID;
    const rich=isPick&&PP;
    page(`${LISTING.path}${p.slug}`,
      head(rich?`${p.name}, Da Nang: Menu, Prices & Hours`:`${p.name} — ${cfg.ITEM_NOUN} in ${p.area}, Da Nang`,
        rich?`${p.name}, ${PP.street}, ${PP.neighbourhood}, Da Nang: ${r1(p.rating)}★ from ${p.reviews} Google reviews, ${PP.hours.human}, English spoken. Full menu with prices: ${cfg.PICK_PRICES||''}.`
          :`${p.name}, ${p.address} · ${p.rating}★ from ${p.reviews} Google reviews. Opening hours, map, phone and what to expect.`,url)
      +ld({"@context":"https://schema.org","@type":ITEM_TYPE,"@id":url+'#biz',"name":p.name,
        ...(rich?pickLd(p):{}),
        "address":{"@type":"PostalAddress","streetAddress":rich?`${PP.street}, ${PP.ward}`:p.address,"addressLocality":"Da Nang","addressRegion":"Đà Nẵng",...(rich?{"postalCode":PP.postcode}:{}),"addressCountry":"VN"},
        "geo":{"@type":"GeoCoordinates","latitude":p.lat,"longitude":p.lng},
        "aggregateRating":{"@type":"AggregateRating","ratingValue":p.rating,"reviewCount":p.reviews,"bestRating":5,"worstRating":1},
        /* The individual reviews are what makes a page eligible for a review
           snippet — an aggregate alone often is not. These are Google's own,
           reproduced with the author each one carries. */
        ...((p.reviewList||[]).length?{"review":(p.reviewList||[]).slice(0,5).map(r=>({
          "@type":"Review",
          "reviewRating":{"@type":"Rating","ratingValue":r.rating,"bestRating":5,"worstRating":1},
          "author":{"@type":"Person","name":r.author||"Google user"},
          ...(r.time?{"datePublished":String(r.time).slice(0,10)}:{}),
          "reviewBody":r.text,
          "publisher":{"@type":"Organization","name":"Google"}}))}:{}),
        ...(p.phone?{"telephone":p.phone}:{}),...(p.site?{"url":p.site}:{}),
        ...(p.hours&&p.hours.length?{"openingHours":p.hours}:{}),
        "hasMap":p.maps,"areaServed":"Da Nang","isAccessibleForFree":false})
      +ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Guide","item":SITE+"/"},
        {"@type":"ListItem","position":2,"name":LISTING.navLabel,"item":SITE+LISTING.path},
        {"@type":"ListItem","position":3,"name":p.area,"item":`${SITE}${LISTING.path}area/${slugify(p.area)}/`},
        {"@type":"ListItem","position":4,"name":p.name,"item":url}]})
      +(rich?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":pickFaq(p).map(([q,a])=>
        ({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}):'')
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="${LISTING.path}">${LISTING.navLabel}</a> → <a href="${LISTING.path}area/${slugify(p.area)}/">${esc(p.area)}</a> → <span>${esc(p.name)}</span></nav></div>
<section class="wrap biz">
<div class="biz-h">
<div>
${isPick?`<p class="eyebrow">${cfg.PICK_EYEBROW}</p>`:`<p class="eyebrow">${esc(p.area)}</p>`}
<h1>${esc(p.name)}</h1>
<p class="rating big"><b>${p.rating}</b> <span class="st">${stars(p.rating)}</span> <span class="rc">${p.reviews} Google reviews</span></p>
<p class="biz-a">${esc(p.address)}</p>
<p class="acts">
<a class="btn" href="${p.maps}" rel="${rel(p)}">Directions</a>
${p.phone?`<a class="btn ghost" href="tel:${p.phone.replace(/\s/g,'')}">${esc(p.phone)}</a>`:''}
${p.site?`<a class="btn ghost" href="${p.site}" rel="${rel(p)}">Website</a>`:''}
${p.instagram?`<a class="btn ghost" href="${p.instagram}" rel="${rel(p)}">Instagram</a>`:''}
${p.facebook?`<a class="btn ghost" href="${p.facebook}" rel="${rel(p)}">Facebook</a>`:''}
${isPick?`<a class="btn" href="${PARTNER.whatsapp}" rel="noopener">Book on WhatsApp</a>`:''}
</p></div>
<div class="biz-map">${gphoto(p,0,'lead')}<iframe title="Map of ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
 src="https://maps.google.com/maps?q=${p.lat},${p.lng}&z=16&output=embed"></iframe></div>
</div>
<div class="ans"><p class="ans-q">${esc(p.name)} at a glance</p>
${rich?`<p>${esc(p.name)} is a nail salon and head spa at ${esc(PP.street)}, ${esc(PP.neighbourhood)}, Da Nang, ${PP.beach.metres} m (${esc(PP.beach.walk)} on foot) from ${esc(PP.beach.name)}. It is ${esc(PP.hours.human)}${PP.walkIns?' and takes walk-ins':''}. ${esc(PP.languagesSentence)} Google reviewers give it ${r1(p.rating)}★ from ${p.reviews.toLocaleString('en-GB')} reviews. ${esc(factsEN(p.name))} ${esc(cfg.PICK_PRICES_SENTENCE||'')}</p>`
:`<p>${esc(p.name)} is ${p.type?`a ${esc(p.type.toLowerCase())}`:`a ${cfg.ITEM_NOUN.toLowerCase()}`} in ${esc(p.area)}, Da Nang — ${p.rating}★ from ${p.reviews.toLocaleString('en-GB')} public Google reviews, at ${esc(p.address)}${p.hours&&p.hours.length?', with opening hours published below':''}. ${cfg.PROFILE_ANS_TAIL||`Typical prices for this kind of visit are on the <a href="/prices/">prices page</a>.`}</p>`}</div>
<div class="biz-g">
<div class="biz-c"><h2>Opening hours</h2>${p.hours&&p.hours.length
  ?`<ul class="hrs">${p.hours.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>`
  :`<p class="m">Not published on Google. Call ahead or message the salon.</p>`}</div>
<div class="biz-c"><h2>What it is</h2>
<p>${esc(p.name)} is ${p.type?`a ${esc(p.type.toLowerCase())}`:`a ${cfg.ITEM_NOUN.toLowerCase()}`} in ${esc(p.area)}, Da Nang, holding ${p.rating} stars across ${p.reviews} public Google reviews.${p.summary?` ${esc(p.summary)}`:''}</p>
${isPick?`<p>${cfg.PICK_TEXT}</p>`:`<p>Before you sit down, run the <a href="${cfg.CHECK_PATH}">${cfg.CHECK_LABEL}</a> — a Google rating measures how people felt, not how the tools were cleaned.</p>`}
<p>What treatments here should cost is on the <a href="/prices/">prices page</a>.</p></div>
</div>
${rich?pickBody(p):''}
${(p.photoList||[]).length>1?`<h2>Inside</h2>${gallery(p)}`:''}
${reviews(p)}
${readerBlock(p)}
${!isPick?pick(true):''}
${near.length?`<h2>Other ${cfg.ITEM_NOUN.toLowerCase()}s in ${esc(p.area)}</h2>${list(near)}
<p><a class="btn ghost" href="${LISTING.path}area/${slugify(p.area)}/">All ${ranked.filter(x=>x.area===p.area).length} in ${esc(p.area)}</a></p>`:''}
</section>`+footer(),'0.6',PLACES_DATE);
  });

  /* ================= AREA + STREET PAGES ================= */
  AREAS.forEach(a=>{
    const key=`${LISTING.path}area/${a.slug}/`, mine=hasPick(a.list), L=placed(a.list,key);
    const aFaq=mine?faqEN(key):null;
    page(`${LISTING.path}area/${a.slug}`,
      head(`Top ${a.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s in ${a.name}, Da Nang (${NOW.getUTCFullYear()})`,
        `The ${a.list.length} best-rated ${cfg.ITEM_NOUN.toLowerCase()}s in ${a.name}, Da Nang — real Google ratings, addresses, opening hours and maps. Updated ${human(PLACES_DATE)}.`,
        `${SITE}${LISTING.path}area/${a.slug}/`)
      +itemList(L,`${cfg.ITEM_NOUN}s in ${a.name}, Da Nang`)
      +(aFaq?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[aFaq].map(([q,x])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":x}}))}):'')
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="${LISTING.path}">${LISTING.navLabel}</a> → <span>${esc(a.name)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${a.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s · updated ${human(PLACES_DATE)}</p>
<h1>Top ${a.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s in ${esc(a.name)}</h1>
<p class="lede">${cfg.AREA_LEDE(a.name,a.list.length)}</p></header>
<div class="ans"><p class="ans-q">What is the best ${cfg.ITEM_NOUN.toLowerCase()} in ${esc(a.name)}, Da Nang?</p>
<p>${mine?`${esc(openEN(key,`${cfg.ITEM_NOUN.toLowerCase()}s in ${a.name}, Da Nang`))} `:a.list[0]?`${esc(a.list[0].name)} leads this guide's ranking for ${esc(a.name)}: ${r1(a.list[0].rating)}★ from ${a.list[0].reviews} public Google reviews, at ${esc(a.list[0].address)}. `:''}${a.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s in ${esc(a.name)} carry a public Google rating with at least twenty reviews, averaging ${(a.list.reduce((s,x)=>s+x.rating,0)/a.list.length).toFixed(2)}★ across ${a.list.reduce((s,x)=>s+x.reviews,0).toLocaleString('en-GB')} reviews between them. ${cfg.AREA_ANSWER||''}</p></div>
<div class="chips">${AREAS.map(x=>`<a class="chip${x.slug===a.slug?' on':''}" href="${LISTING.path}area/${x.slug}/">${esc(x.name)}<b>${x.list.length}</b></a>`).join('')}</div>
${mine?pickTable(key,false):''}
${list(L)}
${aFaq?`<h2>Frequently asked</h2><div class="faq"><details><summary>${esc(aFaq[0])}</summary><p>${esc(aFaq[1])}</p></details></div>`:''}
${mine?conclEN(key):altEN(key,a.name,a.list)}
${STREETS.filter(s=>s.list.some(p=>p.area===a.name)).length?`<h2>Streets in ${esc(a.name)}</h2>
<div class="chips">${STREETS.filter(s=>s.list.some(p=>p.area===a.name)).map(s=>`<a class="chip" href="${LISTING.path}street/${s.slug}/">${esc(s.name)}<b>${s.list.length}</b></a>`).join('')}</div>`:''}
</section>`+footer(),'0.8',PLACES_DATE);
  });

  STREETS.forEach(s=>{
    const L=placed(s.list,`${LISTING.path}street/${s.slug}/`);
    page(`${LISTING.path}street/${s.slug}`,
      head(`Top ${s.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s on ${s.name}, Da Nang`,
        `Every ${cfg.ITEM_NOUN.toLowerCase()} on ${s.name} in Da Nang — ${s.list.length} addresses with real Google ratings, hours and maps. Updated ${human(PLACES_DATE)}.`,
        `${SITE}${LISTING.path}street/${s.slug}/`)
      +itemList(L,`${cfg.ITEM_NOUN}s on ${s.name}, Da Nang`)
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="${LISTING.path}">${LISTING.navLabel}</a> → <span>${esc(s.name)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${s.list.length} on this street</p>
<h1>${cfg.KW_AREA_PREFIX} ${esc(s.name)}</h1>
<p class="lede">${s.name} runs through ${esc([...new Set(s.list.map(p=>p.area))].join(' and '))}. These ${s.list.length} are the addresses worth knowing, with what Google's reviewers make of them.</p></header>
${list(L)}
${pick(true)}
<div class="chips">${STREETS.filter(x=>x.slug!==s.slug).slice(0,12).map(x=>`<a class="chip" href="${LISTING.path}street/${x.slug}/">${esc(x.name)}<b>${x.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'0.7',PLACES_DATE);
  });

  /* ================= SERVICE / KEYWORD PAGES ================= */
  SERVICES.forEach(s=>{
    const url=`${SITE}/services/${s.slug}/`;
    page(`/services/${s.slug}`,
      head(`${s.h1} in Da Nang ${NOW.getUTCFullYear()} — Prices, What to Expect & the Best ${PLACES.length?"Places":"Salons"} | ${NAME}`,s.desc,url)
      +ld({"@context":"https://schema.org","@type":"Article","headline":`${s.h1} in Da Nang`,
        "description":s.desc,"dateModified":TODAY,"mainEntityOfPage":url,
        "author":authorLd()})
      +(s.faq?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":s.faq.map(([q,a])=>
        ({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}):'')
      +nav('/services/')
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="/prices/">Treatments</a> → <span>${esc(s.h1)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${esc(s.eyebrow)}</p>
<h1>${esc(s.h1)} in Da Nang</h1><p class="lede">${esc(s.lede)}</p>${byline(TODAY)}</header>
${s.photo&&PHOTOS[s.photo]?`<figure class="wide"><img src="/assets/photos/${PHOTOS[s.photo].file}" alt="${esc(s.h1)}" loading="lazy" width="1200" height="640"></figure>`:''}
<div class="cols">
<div class="prose">${s.body}</div>
<aside class="side">
${(s.prices||[]).length?`<h3>What it costs</h3>
<table class="pt">${s.prices.map(([n,p])=>`<tr><td>${esc(n)}</td><td class="r">${esc(p)}</td></tr>`).join('')}</table>
<p class="m">${cfg.PRICE_NOTE||'Compiled from menus posted around the city.'} Full tables on the <a href="/prices/">prices page</a>.</p>`
:`<h3>What it costs</h3><p class="m">${s.noPriceNote||'Prices vary from house to house: ask for the menu, with the minutes stated, before you sit down.'}</p>`}
</aside></div>
${pick()}
${s.faq?`<h2>Frequently asked</h2><div class="faq">${s.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`:''}
<h2>Where to get it</h2>
${list(placed(ranked,`/services/${s.slug}/`).slice(0,12))}
<p><a class="btn ghost" href="${LISTING.path}">All ${PLACES.length} ${cfg.ITEM_NOUN.toLowerCase()}s ranked</a></p>
</section>`+footer(),'0.9');
  });


  /* ---------------- "Best X in Da Nang" pages ----------------
     Engineered for extraction rather than for scrolling. What an answer engine
     lifts is the first self-contained paragraph, a named list with a reason per
     entry, and a FAQ whose questions are phrased the way people actually ask.
     Everything below is built from the same Google data as the rest of the site
     — the ranking is the guide's, the ratings are Google's, and both say so. */
  (cfg.BESTOF||[]).forEach(b=>{
    const url=`${SITE}/${b.slug}/`;
    /* The guide's ranking cut at b.count: the score order, with the pick
       placed by the editors among the first three (the method says so under
       the list). The pick is introduced first, in figures, then a table, one
       FAQ entry and a conclusion: what an answer engine quotes. */
    const key=`/${b.slug}/`;
    const top=placed(ranked,key).slice(0,b.count||10);
    const dataLeader=byGoogle[0];
    const fillB=x=>String(x==null?'':x).replace(/\{n\}/g,PLACES.length);
    const ww=`${b.what||b.noun} in Da Nang`;
    const answer=featured
      ?`${openEN(key,ww)} ${factsEN(featured.name)} Ordered by the score alone, the leaders are ${top3EN()}. ${fillB(b.answerTail)}`.replace(/\s{2,}/g,' ')
      :`${top[0].name} leads this guide's ranking for ${b.noun} in Da Nang. ${fillB(b.answerTail)}`;
    const featuredBox=pickTable(key,true);
    const bFaq=faqEN(key);
    const FAQS=[[b.question,answer],...(bFaq?[bFaq]:[]),...b.faq];
    page('/'+b.slug,
      head(`${b.h1} (${NOW.getUTCFullYear()})`,
        b.desc,url)
      +ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":
        FAQS.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))})
      +ld({"@context":"https://schema.org","@type":"ItemList","name":b.h1,
        "description":b.desc,"numberOfItems":top.length,
        "itemListOrder":"https://schema.org/ItemListOrderDescending",
        "itemListElement":top.map((p,i)=>({"@type":"ListItem","position":i+1,
          "item":{"@type":ITEM_TYPE,"name":p.name,"url":`${SITE}${LISTING.path}${p.slug}/`,
            "address":{"@type":"PostalAddress","streetAddress":p.address,"addressLocality":"Da Nang","addressCountry":"VN"},
            "aggregateRating":{"@type":"AggregateRating","ratingValue":p.rating,"reviewCount":p.reviews,"bestRating":5},
            "geo":{"@type":"GeoCoordinates","latitude":p.lat,"longitude":p.lng}}}))})
      +ld({"@context":"https://schema.org","@type":"Article","headline":b.h1,"description":b.desc,
        "datePublished":"2026-08-01","dateModified":PLACES_DATE||TODAY,"mainEntityOfPage":url,
        ...((featured&&(featured.photoList||[]).length)?{"image":`${SITE}/assets/places/${featured.photoList[0].file}`}:{}),
        "author":authorLd(),"publisher":{"@type":"Organization","name":NAME,"url":SITE+"/",
          "logo":{"@type":"ImageObject","url":SITE+"/icon-512.png","width":512,"height":512}}})
      +ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Guide","item":SITE+"/"},
        {"@type":"ListItem","position":2,"name":b.h1,"item":url}]})
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>${esc(b.h1)}</span></nav></div>
<section class="wrap">
<header class="ph" style="max-width:64ch">
<p class="eyebrow">Data snapshot ${human(PLACES_DATE||TODAY)} · ${PLACES.length} venues compared</p>
<h1>${esc(b.h1)}</h1>
${byline(TODAY)}
</header>

<div class="ans"><p class="ans-q">${esc(b.question)}</p><p>${esc(answer)}</p></div>

<div class="prose"><p>${fillB(b.intro)}</p></div>
${featuredBox}
<h2>${b.listH2}</h2>
<ol class="bl">${top.map((p,i)=>`<li class="bl-i${p.id===FEATURED_ID?' is-pick':''}">
<div class="bl-n">${i+1}</div>
<div class="bl-b">
<h3><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a>${p.id===FEATURED_ID?` <span class="badge">${cfg.PICK_BADGE}</span>`:''}</h3>
<p class="bl-m">${esc(p.area)} · ${esc(p.address)}</p>
<p class="rating"><b>${p.rating}</b> ${stars(p.rating)} <span class="rc">${p.reviews} Google reviews</span></p>
<p class="bl-w"><strong>Why it is here:</strong> ${b.reason(p,i)}</p>
<p class="bl-a"><a href="${LISTING.path}${p.slug}/">Hours, map and reviews →</a>${p.maps?` · <a href="${p.maps}" rel="${rel(p)}">Google Maps</a>`:''}${p.instagram?` · <a href="${p.instagram}" rel="${rel(p)}">Instagram</a>`:''}</p>
</div>
${(p.photoList||[]).length?`<figure class="bl-p"><img src="/assets/places/${p.photoList[0].file}" alt="${esc(p.name)}" loading="lazy" width="400" height="300"></figure>`:''}
</li>`).join('')}</ol>

<h2>How is this list made?</h2>
<div class="prose">${fillB(b.method)}
${top.some(p=>p.id===dataLeader.id)?'':`<p>By raw Google rating alone, the top-rated ${cfg.ITEM_NOUN.toLowerCase()} in Da Nang is <a href="${LISTING.path}${dataLeader.slug}/">${esc(dataLeader.name)}</a> (${dataLeader.rating}★ from ${dataLeader.reviews} reviews). It leads the <a href="${LISTING.path}by-google-rating/">unweighted list</a>; this page weighs the rating by the number of reviews behind it, which is not the same thing.</p>`}
<p>The score is a Bayesian average: ${esc(FORMULA)}. In practice ${EXAMPLE}. ${hasPick(top)?PLACED_NOTE:''} This page shows the top ${top.length}. The complete ranking is at <a href="${LISTING.path}">${LISTING.path}</a> and the untouched Google order at <a href="${LISTING.path}by-google-rating/">${LISTING.path}by-google-rating/</a>.</p></div>

${(b.prices||[]).length?`<h2>How much does it cost?</h2>
<table class="data"><tr><th>Service</th><th style="text-align:right">Typical price in Da Nang</th></tr>
${b.prices.map(([a,c])=>`<tr><td>${esc(a)}</td><td class="r">${esc(c)}</td></tr>`).join('')}</table>
<p class="m">${cfg.PRICE_NOTE||'Compiled from menus posted publicly around the city.'} Full tables on the <a href="/prices/">prices page</a>.</p>`:''}

<h2>Frequently asked questions</h2>
<div class="faq">${FAQS.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
${conclEN(key)}

<p class="acts"><a class="btn" href="${LISTING.path}">All ${PLACES.length} ranked</a><a class="btn ghost" href="${LISTING.path}by-google-rating/">Sorted by Google rating alone</a></p>
</section>`+footer(),'0.95');
  });


  /* ---------------- Localised page sets ----------------
     Each locale gets its own best-of page, full ranked listing, price page and
     area pages — not a single translated landing. hreflang is emitted for the
     whole set so each market's version is the one that surfaces there. */
  const LOC = cfg.LOCALES||{};
  const locPath=(code,sub='')=>`${code==='en'?'':'/'+code}${sub}`;
  const altLinks=(sub='')=>Object.keys(LOC).map(c=>
    `<link rel="alternate" hreflang="${c}" href="${SITE}${locPath(c,sub)||'/'}">`).join('')
    +`<link rel="alternate" hreflang="x-default" href="${SITE}${sub||'/'}">`;

  const locNav=(code,active)=>{
    const L=LOC[code]; if(!L) return nav(active);
    const b=locPath(code);
    return `<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap navin">
<a class="brand" href="${b||'/'}">${cfg.BRAND}</a>
<nav class="nlinks" aria-label="Main">
<a href="${b}/best/"${active==='best'?' aria-current="page"':''}>${esc(L.nav.best)}</a>
<a href="${b}/all/"${active==='all'?' aria-current="page"':''}>${esc(L.nav.all)}</a>
<a href="${b}/prices/"${active==='prices'?' aria-current="page"':''}>${esc(L.nav.prices)}</a>
</nav>
<details class="lang"><summary>${L.label}</summary><div>${Object.entries(LOC).map(([c,x])=>
 `<a href="${locPath(c)||'/'}/">${esc(x.name)}</a>`).join('')}</div></details>
</div></header><main id="main">`;
  };

  const buildLocale=(code)=>{
    const L=LOC[code]; if(!L||code==='en') return;
    const T=L.t, y=NOW.getUTCFullYear(), b=locPath(code);
    const fill=s=>String(s).replace(/\{n\}/g,PLACES.length).replace(/\{y\}/g,y);
    /* Same rules as the English pages: the score order, the pick placed by
       the editors among the first three of the lists it belongs to (and the
       method says so), the pick introduced in figures, a table, one FAQ entry
       and a conclusion. No partnership line near a ranking: that is on /about/. */
    const f=featured;
    const D=PICK_I18N[code]||PICK_I18N.en;
    const P=PICK_LOC[code]||null;
    const facts=(f&&FACTS)?[FACTS.perfect?D.perfect(FACTS.perfect,FACTS.thr):'',FACTS.bothTop?D.both(FACTS.both):''].filter(Boolean).join(D.sep):'';
    const prices=(cfg.PICK_PRICE_KEYS||[]).map(([k,v])=>`${D.p[k]||k} ${v}`).join(' · ');
    const top3=FACTS?FACTS.top3.map(p=>`${p.name} (${r1(p.rating)}★, ${p.reviews})`).join(', '):'';
    const dloc=(()=>{try{return new Date(PLACES_DATE+'T00:00:00Z').toLocaleDateString(code==='zh'?'zh-CN':code,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});}catch(e){return PLACES_DATE;}})();
    const X=(f&&PP&&P)?{N:f.name,R:r1(f.rating),V:String(f.reviews),date:dloc,street:PP.street,ward:PP.ward,nb:PP.neighbourhood,
      m:String(PP.beach.metres),prices,what:cfg.ITEM_KIND==='spa'?P.whatS:P.whatN,C:C.toFixed(2),M:String(M)}:null;
    const fx=(t,extra)=>String(t).replace(/\{(\w+)\}/g,(m0,k)=>(extra&&extra[k]!=null)?extra[k]:(X&&X[k]!=null?X[k]:m0));
    const lopen=key=>X?fx(pv(key,P.open,1)):'';
    const lconcl=key=>X?`<h2>${esc(P.concH)}</h2><div class="prose"><p>${esc(fx(pv(key,P.concl,5)))} <a href="${LISTING.path}${f.slug}/">→</a></p></div>`:'';
    const lfaq=X?[fx(P.faq[0]),fx(P.faq[1])]:null;
    const lalt=(area,list)=>{const c=centre(list); if(!X||!c) return '';
      return `<h2>${esc(P.concH)}</h2><div class="prose"><p>${esc(fx(P.alt,{area,km:km(c.lat,c.lng,f.lat,f.lng).toFixed(1)}))} <a href="${LISTING.path}${f.slug}/">→</a></p></div>`;};
    const method=arr=>`${fill(T.method)}${X?' '+fx(P.formula):''}${(X&&hasPick(arr))?' '+P.placed:''}`;
    const answerFor=(key,arr)=>f&&X
      ? `${lopen(key)} ${facts?facts+D.end+' ':''}${D.top3(PLACES.length,top3)} ${method(arr)}`
      : method(arr);
    const locTable=(withReach)=>X?`<div class="pick-t"><table class="data"><caption>${esc(fx(P.cap))}</caption>${P.rows.map(([a,c])=>`<tr><th scope="row">${esc(a)}</th><td>${esc(fx(c))}</td></tr>`).join('')}
<tr><th scope="row">${esc(T.pickLabel)}</th><td><a href="${LISTING.path}${f.slug}/">${esc(f.name)}</a></td></tr></table>
${withReach?REACH:''}</div>`:'';
    const faqBlock=(base)=>[...(lfaq?[lfaq]:[]),...base];

    const rowsHtml=T.rows.map(([a,c])=>`<tr><td>${esc(a)}</td><td class="r">${esc(c)}</td></tr>`).join('');
    const listHtml=(arr)=>`<ol class="bl">${arr.map((p,i)=>`<li class="bl-i${p.id===FEATURED_ID?' is-pick':''}">
<div class="bl-n">${i+1}</div><div class="bl-b">
<h3><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a>${p.id===FEATURED_ID?` <span class="badge">${esc(T.pickLabel)}</span>`:''}</h3>
<p class="bl-m">${esc(p.area)} · ${esc(p.address)}</p>
<p class="rating"><b>${p.rating}</b> ${stars(p.rating)} <span class="rc">${p.reviews} ${esc(T.reviewsWord)}</span></p>
</div>${(p.photoList||[]).length?`<figure class="bl-p"><img src="/assets/places/${p.photoList[0].file}" alt="${esc(p.name)}" loading="lazy" width="400" height="300"></figure>`:''}</li>`).join('')}</ol>`;
    const faqLd=(arr)=>ld({"@context":"https://schema.org","@type":"FAQPage","inLanguage":code,
      "mainEntity":arr.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))});
    const listLd=(name,arr,n)=>ld({"@context":"https://schema.org","@type":"ItemList","inLanguage":code,"name":name,
      "numberOfItems":arr.length,"itemListElement":arr.slice(0,n||arr.length).map((p,i)=>({"@type":"ListItem","position":i+1,
        "url":`${SITE}${LISTING.path}${p.slug}/`,"name":p.name}))});

    const shell=(sub,title,desc,active,body,prio)=>page(b+sub,
      `<!doctype html><html lang="${code}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${b}${sub}/">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
${GSC.map(x=>`<meta name="google-site-verification" content="${x}">`).join('')}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:locale" content="${code}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${cfg.THEME||'#111'}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${cfg.FONTS}" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css">
${altLinks(sub)}
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "y4txssr5l0");</script></head><body>`+locNav(code,active)+body+footer(),prio,PLACES_DATE);

    /* best-of */
    { const key=`${b}/best/`, top=placed(ranked,key).slice(0,10), ans=answerFor(key,top);
      const faqs=[[T.q,ans],...faqBlock(T.faq)];
    shell('/best',fill(T.bestTitle),fill(T.bestDesc),'best',
      faqLd(faqs)+listLd(fill(T.h1),top)
      +`<section class="wrap"><header class="ph"><p class="eyebrow">${esc(L.name)} · ${human(PLACES_DATE)}</p>
<h1>${esc(fill(T.h1))}</h1></header>
<div class="ans"><p class="ans-q">${esc(T.q)}</p><p>${esc(ans)}</p></div>
${locTable(true)}
<h2>${esc(fill(T.h1))}</h2>${listHtml(top)}
<h2>${esc(T.pricesH)}</h2><table class="data">${rowsHtml}</table>
<h2>${esc(T.methodH)}</h2><div class="prose"><p>${esc(method(top))}</p></div>
<h2>${esc(T.faqH)}</h2><div class="faq">${faqBlock(T.faq).map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
${lconcl(key)}
<p class="acts"><a class="btn" href="${b}/all/">${esc(L.nav.all)}</a><a class="btn ghost" href="${b}/prices/">${esc(L.nav.prices)}</a></p>
</section>`,'0.9'); }

    /* full listing */
    { const key=`${b}/all/`, all=placed(ranked,key), ans=answerFor(key,all);
    shell('/all',`${fill(T.allH)} (${y})`,fill(T.bestDesc),'all',
      listLd(fill(T.allH),all,60)+(lfaq?faqLd([lfaq]):'')
      +`<section class="wrap"><header class="ph"><p class="eyebrow">${esc(L.name)}</p>
<h1>${esc(fill(T.allH))}</h1></header>
<div class="ans"><p class="ans-q">${esc(T.q)}</p><p>${esc(ans)}</p></div>
${locTable(false)}
${listHtml(all)}
${lfaq?`<h2>${esc(T.faqH)}</h2><div class="faq"><details><summary>${esc(lfaq[0])}</summary><p>${esc(lfaq[1])}</p></details></div>`:''}
${lconcl(key)}
<div class="chips">${AREAS.map(a=>`<a class="chip" href="${b}/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
</section>`,'0.8'); }

    /* prices */
    shell('/prices',`${T.pricesH} (${y})`,fill(T.bestDesc),'prices',
      ld({"@context":"https://schema.org","@type":"FAQPage","inLanguage":code,
        "mainEntity":T.faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))})
      +`<section class="wrap"><header class="ph"><p class="eyebrow">${esc(L.name)} · ${y}</p>
<h1>${esc(T.pricesH)}</h1></header>
<table class="data">${rowsHtml}</table>
<h2>${esc(T.faqH)}</h2><div class="faq">${T.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
<h2>${esc(T.areasH)}</h2>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="${b}/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
<p class="acts"><a class="btn" href="${b}/best/">${esc(L.nav.best)}</a></p>
</section>`,'0.7');

    /* one page per area, per language: the pick's own quarter gets the
       placement and the full pick treatment, the others a dated alternative
       with the real straight-line distance. */
    AREAS.forEach(a=>{
      const key=`${b}/area/${a.slug}/`, mine=hasPick(a.list), AL=placed(a.list,key);
      shell(`/area/${a.slug}`,`${a.list.length} ${fill(T.allH)} — ${a.name}`,
        `${a.name}, Da Nang · ${a.list.length} · ${fill(T.bestDesc)}`.slice(0,155),'all',
        listLd(`${a.name} — ${fill(T.allH)}`,AL,30)+(mine&&lfaq?faqLd([lfaq]):'')
        +`<section class="wrap"><header class="ph"><p class="eyebrow">${esc(a.name)} · ${esc(L.name)}</p>
<h1>${a.list.length} — ${esc(a.name)}</h1></header>
${mine&&X?`<div class="ans"><p>${esc(lopen(key))}</p></div>${locTable(false)}`:''}
${listHtml(AL)}
${mine?`<div class="prose"><p class="m">${esc(method(AL))}</p></div>`:''}
${mine&&lfaq?`<h2>${esc(T.faqH)}</h2><div class="faq"><details><summary>${esc(lfaq[0])}</summary><p>${esc(lfaq[1])}</p></details></div>`:''}
${mine?lconcl(key):lalt(a.name,a.list)}
<div class="chips">${AREAS.map(x=>`<a class="chip${x.slug===a.slug?' on':''}" href="${b}/area/${x.slug}/">${esc(x.name)}<b>${x.list.length}</b></a>`).join('')}</div>
<p class="acts"><a class="btn" href="${b}/best/">${esc(L.nav.best)}</a><a class="btn ghost" href="${b}/prices/">${esc(L.nav.prices)}</a></p>
</section>`,'0.6');
    });

    /* locale home → the best-of page, so /ko/ is a real entry point.
       Carries its own schema: build.js only hand-writes L10N homes for a few
       locales, and the rest were shipping with no structured data at all. */
    { const key=`${b}/`, top=placed(ranked,key).slice(0,10), ans=answerFor(key,top);
    shell('',fill(T.bestTitle),fill(T.bestDesc),'best',
      ld({"@context":"https://schema.org","@type":"WebPage","name":fill(T.bestTitle),
        "url":`${SITE}${b}/`,"inLanguage":code,"description":fill(T.bestDesc),
        "isPartOf":{"@type":"WebSite","name":NAME,"url":SITE+"/"}})
      +listLd(fill(T.h1),top)+(lfaq?faqLd([lfaq]):'')
      +`<section class="wrap"><header class="ph"><p class="eyebrow">${esc(L.name)}</p>
<h1>${esc(fill(T.h1))}</h1></header>
<div class="ans"><p class="ans-q">${esc(T.q)}</p><p>${esc(ans)}</p></div>
${locTable(false)}
${listHtml(top)}
<h2>${esc(T.pricesH)}</h2><table class="data">${rowsHtml}</table>
${lfaq?`<h2>${esc(T.faqH)}</h2><div class="faq"><details><summary>${esc(lfaq[0])}</summary><p>${esc(lfaq[1])}</p></details></div>`:''}
${lconcl(key)}
<p class="acts"><a class="btn" href="${b}/all/">${esc(L.nav.all)}</a><a class="btn ghost" href="${b}/prices/">${esc(L.nav.prices)}</a></p>
</section>`,'0.9'); }
  };
  Object.keys(LOC).forEach(buildLocale);

  /* ================= MOVED PAGES ================= */
  /* Every refresh drops or renames venues: Places search results drift, houses
     close, a name edit changes the slug, and a street with one venue left loses
     its page. Google keeps the old URL indexed and it answers 404. In September
     2026 that was about ninety profiles across both guides, four of them among
     headspadanang's top ten pages. redirects.json remembers every data page this
     site has published, with the place id behind each profile, so the next build
     turns the ones that no longer exist into redirects: to the venue's new slug
     when its id is still listed, else to the page one level up (its area), else
     to the listing index. GitHub Pages cannot answer 301, so each redirect is an
     instant meta refresh plus a canonical, which Google treats as permanent.
     A page that comes back simply stops being a redirect. */
  const REG_FILE=cfg.REDIRECTS_FILE||'./redirects.json';
  const REG=fs.existsSync(REG_FILE)?JSON.parse(fs.readFileSync(REG_FILE,'utf8')):{};
  const live=new Set(urls.map(x=>x.u.slice(SITE.length)));
  const areaPath=a=>`${LISTING.path}area/${slugify(a)}/`;
  PLACES.forEach(p=>{REG[`${LISTING.path}${p.slug}/`]={id:p.id,name:p.name,area:p.area,up:areaPath(p.area),to:null};});
  STREETS.forEach(s=>{REG[`${LISTING.path}street/${s.slug}/`]={name:s.name,area:s.list[0].area,up:areaPath(s.list[0].area),to:null};});
  live.forEach(u=>{const m=u.match(/^(\/.*\/)area\/([^/]+)\/$/);
    if(m) REG[u]={name:(AREAS.find(a=>a.slug===m[2])||{}).name,up:m[1]===LISTING.path?LISTING.path:m[1]+'all/',to:null};});
  const byId=new Map(PLACES.map(p=>[p.id,p]));
  let moved=0;
  for(const [from,r] of Object.entries(REG)){
    if(live.has(from)){r.to=null;delete r.since;continue;}
    const now=r.id&&byId.get(r.id);
    r.to=now?`${LISTING.path}${now.slug}/`:live.has(r.up)?r.up:LISTING.path;
    r.since=r.since||TODAY;
    const label=r.name||from;
    const why=now?`<p class="lede">This profile moved to a new address: <a href="${r.to}">${esc(now.name)}</a>.</p>`
      :`<p class="lede">${esc(label)} is not in the guide's current Google Places snapshot (${human(PLACES_DATE)}).</p>
<p class="acts"><a class="btn" href="${r.to}">${r.to===LISTING.path?esc(LISTING.navLabel):`${esc(cfg.ITEM_NOUN)}s nearby`}</a></p>`;
    const dir=OUT+from;
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(dir+'index.html',head(`${label} | ${NAME}`,`${label}: this page has moved.`,SITE+r.to,
      `<meta http-equiv="refresh" content="0;url=${SITE}${r.to}">`)+nav('')
      +`<section class="wrap"><header class="ph"><h1>${esc(label)}</h1>\n${why}</header></section>`+footer());
    moved++;
  }
  fs.writeFileSync(REG_FILE,JSON.stringify(Object.fromEntries(Object.entries(REG).sort(([a],[b])=>a<b?-1:1)),null,1)+'\n');
  if(moved) console.log(`  ${moved} moved pages redirected (${REG_FILE})`);


  return {placed,hasPick,pickTable,openEN,faqEN,conclEN,EXAMPLE,PLACED_NOTE,PV,r1,FACTS,factsEN,top3EN,FORMULA,ord,REACH,PP,C,M,SISTER,
          SITE,TODAY,PLACES,PLACES_DATE,PHOTOS,featured,ranked,others,AREAS,STREETS,
          page,head,nav,footer,pick,list,itemList,byGoogle,score,urls,esc,slugify,human,ld,stars,OUT,credits,gphoto,edPhoto,gallery,reviews,readerBlock,READER,AUTHOR,byline,authorLd};
}

module.exports={buildSite,r1,esc,slugify,human,ld,stars,streetOf};
