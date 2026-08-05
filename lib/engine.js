/* Shared engine for the Da Nang guide sites — zero dependencies.
   Data in, HTML out. Both sites pass a config; everything else is common:
   salon pages, area pages, street pages, service pages, i18n, schema, sitemap. */
const fs=require('fs'),path=require('path');

const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slugify=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/đ/g,'d').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const human=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const ld=o=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const stars=r=>{const f=Math.floor(r);return '★'.repeat(f)+(r-f>=0.5?'⯨':'')+'☆'.repeat(5-f-(r-f>=0.5?1:0));};

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
  const MAX_AGE_DAYS=30;
  let PLACES=[],PLACES_DATE=null;
  if(fs.existsSync(PLACES_FILE)){
    const j=JSON.parse(fs.readFileSync(PLACES_FILE,'utf8'));
    PLACES_DATE=j.fetchedAt;
    const age=Math.floor((new Date(TODAY)-new Date(j.fetchedAt))/86400000);
    if(age>MAX_AGE_DAYS) console.warn(`  ! ${PLACES_FILE} is ${age}d old — listings skipped`);
    else PLACES=(j.places||[]).map(p=>({...p,slug:slugify(p.name)+'-'+p.id.slice(-6).toLowerCase(),street:streetOf(p.address)}));
  }
  const PHOTOS=fs.existsSync(PHOTOS_FILE)?JSON.parse(fs.readFileSync(PHOTOS_FILE,'utf8')).photos||{}:{};
  const featured=PLACES.find(p=>p.id===FEATURED_ID)||null;
  /* Featured house first, then everyone else by rating then volume. */
  const ranked=[...PLACES].sort((a,b)=>
    (a.id===FEATURED_ID?-1:b.id===FEATURED_ID?1:0) || (b.rating-a.rating) || (b.reviews-a.reviews));
  const others=ranked.filter(p=>p.id!==FEATURED_ID);

  const AREAS=[...new Set(PLACES.map(p=>p.area))]
    .map(a=>({name:a,slug:slugify(a),list:ranked.filter(p=>p.area===a)}))
    .sort((x,y)=>y.list.length-x.list.length);
  const STREETS=[...new Set(PLACES.map(p=>p.street).filter(Boolean))]
    .map(s=>({name:s,slug:slugify(s),list:ranked.filter(p=>p.street===s)}))
    .filter(s=>s.list.length>=2).sort((x,y)=>y.list.length-x.list.length);

  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  if(fs.existsSync('./assets')) fs.cpSync('./assets',OUT+'/assets',{recursive:true});
  fs.mkdirSync(OUT+'/assets',{recursive:true});
  fs.writeFileSync(OUT+'/assets/site.css',css);

  const urls=[];
  const page=(p,html,prio='0.6',date=TODAY)=>{
    const dir=OUT+(p==='/'?'':p);
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(dir+'/index.html',html);
    urls.push({u:SITE+(p==='/'?'/':p+'/'),d:date,p:prio});
  };

  /* ---- chrome ---- */
  const NAVL=[[LISTING.path,LISTING.navLabel],...PAGES.map(p=>[p.path,p.nav]),['/journal/','Journal']];
  const head=(t,d,url,extra='')=>`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><meta name="description" content="${esc(d)}">
<link rel="canonical" href="${url}">
${GSC.map(x=>`<meta name="google-site-verification" content="${x}">`).join('')}
<meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:site_name" content="${esc(NAME)}">
${PHOTOS.hero?`<meta property="og:image" content="${SITE}/assets/photos/${PHOTOS.hero.file}">`:''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${cfg.EMOJI}</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${cfg.FONTS}" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css">
${LANGS.map(l=>`<link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}">`).join('')}
<link rel="alternate" hreflang="x-default" href="${SITE}/">
${extra}</head><body>`;

  const nav=a=>`<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap navin">
<a class="brand" href="/">${cfg.BRAND}</a>
<nav class="nlinks" aria-label="Main">${NAVL.map(([u,l])=>`<a href="${u}"${a===u?' aria-current="page"':''}>${l}</a>`).join('')}</nav>
<details class="lang"><summary>EN</summary><div>${LANGS.map(l=>`<a href="${l.path}">${l.native}</a>`).join('')}</div></details>
</div></header><main id="main">`;

  /* Editorial pick — an opinion, stated as one, sitting above the data table. */
  const pick=(compact)=>{
    const p=featured; if(!p) return '';
    return `<aside class="pick${compact?' compact':''}">
<div class="pick-b">
<p class="eyebrow">${cfg.PICK_EYEBROW}</p>
<h3><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a></h3>
<p class="pick-m">${esc(p.address)} · ${cfg.PARTNER.hours}</p>
<p class="rating"><b>${p.rating}</b> <span class="st">${stars(p.rating)}</span> <span class="rc">${p.reviews} Google reviews</span></p>
<p class="pick-t">${cfg.PICK_TEXT}</p>
<p class="acts"><a class="btn" href="${PARTNER.whatsapp}" rel="noopener">Book on WhatsApp</a>
<a class="btn ghost" href="${p.maps}" rel="noopener">Open in Google Maps</a>
<a class="btn ghost" href="${LISTING.path}${p.slug}/">Full profile</a></p>
</div>${PHOTOS.salon&&!compact?`<figure class="pick-p"><img src="/assets/photos/${PHOTOS.salon.file}" alt="" loading="lazy" width="640" height="480"></figure>`:''}</aside>`;
  };

  const kwFooter=()=>{
    const g=[];
    if(SERVICES.length) g.push([cfg.KW_SERVICES_LABEL,SERVICES.map(s=>[`/services/${s.slug}/`,s.kw])]);
    if(AREAS.length)    g.push(['By area',AREAS.map(a=>[`${LISTING.path}area/${a.slug}/`,`${cfg.KW_AREA_PREFIX} ${a.name}`])]);
    if(STREETS.length)  g.push(['By street',STREETS.slice(0,14).map(s=>[`${LISTING.path}street/${s.slug}/`,`${cfg.KW_AREA_PREFIX} ${s.name}`])]);
    if(LANGS.length)    g.push(['Languages',LANGS.map(l=>[l.path,l.native])]);
    return `<div class="kwf">${g.map(([t,items])=>`<div><h4>${t}</h4><ul>${items.map(([u,l])=>`<li><a href="${u}">${esc(l)}</a></li>`).join('')}</ul></div>`).join('')}</div>`;
  };

  const credits=()=>{
    const list=Object.values(PHOTOS);
    if(!list.length) return '';
    const seen=new Set();
    return `<p class="credit">Photography: ${list.filter(p=>!seen.has(p.source)&&seen.add(p.source))
      .map(p=>`<a href="${p.source}" rel="noopener nofollow">${esc(p.creator)}</a> (${esc(p.licence)})`).join(', ')}.</p>`;
  };

  const footer=()=>`</main><footer class="foot"><div class="wrap">
${kwFooter()}
<div class="foot-b">
<p><strong>${esc(NAME)}</strong> · ${esc(TAGLINE)}</p>
<p class="fine">${cfg.FOOT_NOTE} Salon names, ratings, review counts and addresses come from Google · snapshot of ${PLACES_DATE?human(PLACES_DATE):'—'}. We publish no invented reviews or ratings.</p>
${credits()}
<p class="fine"><a href="/about/">About this guide</a> · <a href="/journal/">Journal</a> · © ${NOW.getUTCFullYear()} ${DOMAIN}</p>
</div></div></footer></body></html>`;

  /* ---- listing rows ---- */
  const row=(p,i)=>`<li class="sr${p.id===FEATURED_ID?' is-pick':''}">
<span class="sr-n">${i}</span>
<span class="sr-m">
  <a class="sr-t" href="${LISTING.path}${p.slug}/">${esc(p.name)}</a>
  ${p.id===FEATURED_ID?`<span class="badge">${cfg.PICK_BADGE}</span>`:''}
  <span class="sr-a">${esc(p.address)}</span>
</span>
<span class="sr-r"><b>${p.rating}</b><span class="rc">${p.reviews}</span></span>
<span class="sr-l"><a href="${p.maps}" rel="noopener nofollow">Maps</a>${p.site?` · <a href="${p.site}" rel="noopener nofollow">Site</a>`:''}</span>
</li>`;
  const list=(arr)=>`<ol class="srl">${arr.map((p,i)=>row(p,i+1)).join('')}</ol>
<p class="src">Ordered by Google rating, then review count. ${cfg.PICK_BADGE} marks our editorial pick — an opinion, and the only placement we make. Snapshot of ${human(PLACES_DATE)}.</p>`;

  const itemList=(arr,name)=>ld({"@context":"https://schema.org","@type":"ItemList","name":name,
    "numberOfItems":arr.length,"itemListElement":arr.map((p,i)=>({"@type":"ListItem","position":i+1,
      "url":`${SITE}${LISTING.path}${p.slug}/`,"name":p.name}))});

  /* ================= SALON PAGES ================= */
  PLACES.forEach(p=>{
    const url=`${SITE}${LISTING.path}${p.slug}/`;
    const near=ranked.filter(x=>x.area===p.area&&x.id!==p.id).slice(0,6);
    const isPick=p.id===FEATURED_ID;
    page(`${LISTING.path}${p.slug}`,
      head(`${p.name} · ${cfg.ITEM_NOUN} in ${p.area}, Da Nang${isPick?' — Our Pick':''} | ${NAME}`,
        `${p.name}, ${p.address} · ${p.rating}★ from ${p.reviews} Google reviews. Opening hours, map, phone and what to expect${isPick?' — the guide’s recommended '+cfg.ITEM_NOUN.toLowerCase():''}.`,url)
      +ld({"@context":"https://schema.org","@type":ITEM_TYPE,"@id":url+'#biz',"name":p.name,
        "address":{"@type":"PostalAddress","streetAddress":p.address,"addressLocality":"Da Nang","addressRegion":"Đà Nẵng","addressCountry":"VN"},
        "geo":{"@type":"GeoCoordinates","latitude":p.lat,"longitude":p.lng},
        "aggregateRating":{"@type":"AggregateRating","ratingValue":p.rating,"reviewCount":p.reviews,"bestRating":5},
        ...(p.phone?{"telephone":p.phone}:{}),...(p.site?{"url":p.site}:{}),
        ...(p.hours&&p.hours.length?{"openingHours":p.hours}:{}),
        "hasMap":p.maps,"areaServed":"Da Nang","isAccessibleForFree":false})
      +ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Guide","item":SITE+"/"},
        {"@type":"ListItem","position":2,"name":LISTING.navLabel,"item":SITE+LISTING.path},
        {"@type":"ListItem","position":3,"name":p.area,"item":`${SITE}${LISTING.path}area/${slugify(p.area)}/`},
        {"@type":"ListItem","position":4,"name":p.name,"item":url}]})
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
<a class="btn" href="${p.maps}" rel="noopener nofollow">Directions</a>
${p.phone?`<a class="btn ghost" href="tel:${p.phone.replace(/\s/g,'')}">${esc(p.phone)}</a>`:''}
${p.site?`<a class="btn ghost" href="${p.site}" rel="noopener nofollow">Website</a>`:''}
${isPick?`<a class="btn" href="${PARTNER.whatsapp}" rel="noopener">Book on WhatsApp</a>`:''}
</p></div>
<div class="biz-map"><iframe title="Map of ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
 src="https://maps.google.com/maps?q=${p.lat},${p.lng}&z=16&output=embed"></iframe></div>
</div>
<div class="biz-g">
<div class="biz-c"><h2>Opening hours</h2>${p.hours&&p.hours.length
  ?`<ul class="hrs">${p.hours.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>`
  :`<p class="m">Not published on Google. Call ahead or message the salon.</p>`}</div>
<div class="biz-c"><h2>What it is</h2>
<p>${esc(p.name)} is ${p.type?`a ${esc(p.type.toLowerCase())}`:`a ${cfg.ITEM_NOUN.toLowerCase()}`} in ${esc(p.area)}, Da Nang, holding ${p.rating} stars across ${p.reviews} public Google reviews.</p>
${isPick?`<p>${cfg.PICK_TEXT}</p>`:`<p>Before you sit down, run the <a href="${cfg.CHECK_PATH}">${cfg.CHECK_LABEL}</a> — a Google rating measures how people felt, not how the tools were cleaned.</p>`}
<p>What treatments here should cost is on the <a href="/prices/">prices page</a>.</p></div>
</div>
${!isPick?pick(true):''}
${near.length?`<h2>Other ${cfg.ITEM_NOUN.toLowerCase()}s in ${esc(p.area)}</h2>${list(near)}
<p><a class="btn ghost" href="${LISTING.path}area/${slugify(p.area)}/">All ${ranked.filter(x=>x.area===p.area).length} in ${esc(p.area)}</a></p>`:''}
</section>`+footer(),'0.6',PLACES_DATE);
  });

  /* ================= AREA + STREET PAGES ================= */
  AREAS.forEach(a=>{
    page(`${LISTING.path}area/${a.slug}`,
      head(`${cfg.KW_AREA_PREFIX} ${a.name}, Da Nang · ${a.list.length} Ranked & Mapped | ${NAME}`,
        `The ${a.list.length} best-rated ${cfg.ITEM_NOUN.toLowerCase()}s in ${a.name}, Da Nang — real Google ratings, addresses, opening hours and maps. Updated ${human(PLACES_DATE)}.`,
        `${SITE}${LISTING.path}area/${a.slug}/`)
      +itemList(a.list,`${cfg.ITEM_NOUN}s in ${a.name}, Da Nang`)
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="${LISTING.path}">${LISTING.navLabel}</a> → <span>${esc(a.name)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${a.list.length} ${cfg.ITEM_NOUN.toLowerCase()}s · updated ${human(PLACES_DATE)}</p>
<h1>${cfg.KW_AREA_PREFIX} ${esc(a.name)}</h1>
<p class="lede">${cfg.AREA_LEDE(a.name,a.list.length)}</p></header>
<div class="chips">${AREAS.map(x=>`<a class="chip${x.slug===a.slug?' on':''}" href="${LISTING.path}area/${x.slug}/">${esc(x.name)}<b>${x.list.length}</b></a>`).join('')}</div>
${pick(true)}
${list(a.list)}
${STREETS.filter(s=>s.list.some(p=>p.area===a.name)).length?`<h2>Streets in ${esc(a.name)}</h2>
<div class="chips">${STREETS.filter(s=>s.list.some(p=>p.area===a.name)).map(s=>`<a class="chip" href="${LISTING.path}street/${s.slug}/">${esc(s.name)}<b>${s.list.length}</b></a>`).join('')}</div>`:''}
</section>`+footer(),'0.8',PLACES_DATE);
  });

  STREETS.forEach(s=>{
    page(`${LISTING.path}street/${s.slug}`,
      head(`${cfg.KW_AREA_PREFIX} ${s.name}, Da Nang · ${s.list.length} on This Street | ${NAME}`,
        `Every ${cfg.ITEM_NOUN.toLowerCase()} on ${s.name} in Da Nang — ${s.list.length} addresses with real Google ratings, hours and maps. Updated ${human(PLACES_DATE)}.`,
        `${SITE}${LISTING.path}street/${s.slug}/`)
      +itemList(s.list,`${cfg.ITEM_NOUN}s on ${s.name}, Da Nang`)
      +nav(LISTING.path)
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="${LISTING.path}">${LISTING.navLabel}</a> → <span>${esc(s.name)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${s.list.length} on this street</p>
<h1>${cfg.KW_AREA_PREFIX} ${esc(s.name)}</h1>
<p class="lede">${s.name} runs through ${esc([...new Set(s.list.map(p=>p.area))].join(' and '))}. These ${s.list.length} are the addresses worth knowing, with what Google's reviewers make of them.</p></header>
${list(s.list)}
${pick(true)}
<div class="chips">${STREETS.filter(x=>x.slug!==s.slug).slice(0,12).map(x=>`<a class="chip" href="${LISTING.path}street/${x.slug}/">${esc(x.name)}<b>${x.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'0.7',PLACES_DATE);
  });

  /* ================= SERVICE / KEYWORD PAGES ================= */
  SERVICES.forEach(s=>{
    const url=`${SITE}/services/${s.slug}/`;
    page(`/services/${s.slug}`,
      head(`${s.h1} in Da Nang — Prices, What to Expect & Where to Go (${NOW.getUTCFullYear()}) | ${NAME}`,s.desc,url)
      +ld({"@context":"https://schema.org","@type":"Article","headline":`${s.h1} in Da Nang`,
        "description":s.desc,"dateModified":TODAY,"mainEntityOfPage":url,
        "author":{"@type":"Organization","name":NAME,"url":SITE+'/'}})
      +(s.faq?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":s.faq.map(([q,a])=>
        ({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}):'')
      +nav('/services/')
      +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="/prices/">Treatments</a> → <span>${esc(s.h1)}</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">${esc(s.eyebrow)}</p>
<h1>${esc(s.h1)} in Da Nang</h1><p class="lede">${esc(s.lede)}</p></header>
${s.photo&&PHOTOS[s.photo]?`<figure class="wide"><img src="/assets/photos/${PHOTOS[s.photo].file}" alt="${esc(s.h1)}" loading="lazy" width="1200" height="640"></figure>`:''}
<div class="cols">
<div class="prose">${s.body}</div>
<aside class="side">
<h3>What it costs</h3>
<table class="pt">${s.prices.map(([n,p])=>`<tr><td>${esc(n)}</td><td class="r">${esc(p)}</td></tr>`).join('')}</table>
<p class="m">Compiled from menus posted around the city. Full tables on the <a href="/prices/">prices page</a>.</p>
</aside></div>
${pick()}
${s.faq?`<h2>Frequently asked</h2><div class="faq">${s.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`:''}
<h2>Where to get it</h2>
${list(ranked.slice(0,12))}
<p><a class="btn ghost" href="${LISTING.path}">All ${PLACES.length} ${cfg.ITEM_NOUN.toLowerCase()}s ranked</a></p>
</section>`+footer(),'0.9');
  });

  return {SITE,TODAY,PLACES,PLACES_DATE,PHOTOS,featured,ranked,others,AREAS,STREETS,
          page,head,nav,footer,pick,list,itemList,urls,esc,slugify,human,ld,stars,OUT,credits};
}

module.exports={buildSite,esc,slugify,human,ld,stars,streetOf};
