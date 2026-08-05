/* Shared engine for the Da Nang guide sites — zero dependencies.
   Data in, HTML out. Both sites pass a config; everything else is common:
   salon pages, area pages, street pages, service pages, i18n, schema, sitemap. */
const fs=require('fs'),path=require('path');

const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slugify=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/đ/g,'d').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const human=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const ld=o=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
/* Precise star bar: the gold layer is clipped to the exact rating, so 4.7, 4.9
   and 5.0 are visibly different instead of all rounding to five stars. */
const stars=r=>{const pct=Math.max(0,Math.min(100,(Number(r)/5)*100));
  return `<span class="sb" role="img" aria-label="${r} out of 5"><span class="sb-b">★★★★★</span><span class="sb-f" style="width:${pct.toFixed(1)}%">★★★★★</span></span>`;};

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
    else PLACES=(j.places||[]).map(p=>({...p,slug:slugify(p.name)+'-'+p.id.slice(-6).toLowerCase(),street:streetOf(p.address),
      /* Google still lists the featured house's Instagram as its website; point at
         the real site instead, and keep the social link separate. */
      ...(p.id===cfg.FEATURED_ID&&cfg.PARTNER&&cfg.PARTNER.site
          ? {social:p.site||'',site:cfg.PARTNER.site} : {})}));
  }
  /* A named author is only worth having if the person is real and has agreed to
     it: search engines and readers both check. author.json stays absent until
     someone actually signs off, and nothing bylined renders without it. */
  const AUTHOR=fs.existsSync('./author.json')?JSON.parse(fs.readFileSync('./author.json','utf8')):null;
  const PHOTOS=fs.existsSync(PHOTOS_FILE)?JSON.parse(fs.readFileSync(PHOTOS_FILE,'utf8')).photos||{}:{};
  const featured=PLACES.find(p=>p.id===FEATURED_ID)||null;

  /* Two orderings, both published, each labelled for what it is.
     `ranked`  — the guide's own list. An editorial judgement: our pick leads it,
                 then a score that rewards sustained volume as well as a high
                 average, because a 5.0 from 25 visits says less than a 4.8 from
                 1,500. Criteria are printed under every table that uses it.
     `byGoogle`— Google's own numbers, untouched, published alongside so anyone
                 can check the guide against the raw data in one click. */
  const C=PLACES.length?PLACES.reduce((s,p)=>s+p.rating,0)/PLACES.length:4.8;
  const M=120;                       // prior weight, ≈ a median Da Nang review count
  const score=p=>((p.reviews*p.rating)+(M*C))/(p.reviews+M);
  const ranked=[...PLACES].sort((a,b)=>
    (a.id===FEATURED_ID?-1:b.id===FEATURED_ID?1:0) || (score(b)-score(a)) || (b.reviews-a.reviews));
  const byGoogle=[...PLACES].sort((a,b)=>(b.rating-a.rating)||(b.reviews-a.reviews));
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
  const pick=(compact)=>{
    const p=featured; if(!p) return '';
    const ph=pickPhoto();
    if(compact) return `<aside class="ednote">
<p class="ednote-l">Editor's note</p>
<p>Of the ${PLACES.length} here, the one we send people to is
<a href="${LISTING.path}${p.slug}/"><strong>${esc(p.name)}</strong></a> in ${esc(p.area)} —
${p.rating}★ from ${p.reviews} reviews, ${cfg.PICK_ONELINE}
<a href="${LISTING.path}${p.slug}/">Read why →</a></p>
</aside>`;
    return `<aside class="ed">
<div class="ed-t"><span class="ed-l">Editor's note</span><span class="ed-r"></span></div>
<div class="ed-g">
<div class="ed-b">
<h3><a href="${LISTING.path}${p.slug}/">${esc(p.name)}</a></h3>
<p class="ed-m">${esc(p.area)} · ${esc(p.address)}</p>
<p class="rating"><b>${p.rating}</b> <span class="st">${stars(p.rating)}</span> <span class="rc">${p.reviews} reviews</span></p>
<p>${cfg.PICK_TEXT}</p>
<p class="ed-a"><a href="${LISTING.path}${p.slug}/">Full profile, hours and map →</a></p>
</div>
${ph?`<figure class="ed-p"><img src="${ph.src}" alt="${esc(p.name)}" loading="lazy" width="900" height="600">${ph.credit?`<figcaption>Photo: ${esc(ph.credit)} · Google</figcaption>`:''}</figure>`:''}
</div></aside>`;
  };

  /* Google requires the author attributions returned with each photo to be shown. */
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
 <a href="${p.maps}" rel="noopener nofollow">leave a review on Google</a> — it is public, verifiable and it feeds the ratings on this page.</p>`;
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
<span class="sr-r"><b>${p.rating}</b>${stars(p.rating)}<span class="rc">${p.reviews}</span></span>
<span class="sr-l"><a href="${p.maps}" rel="noopener nofollow">Maps</a>${p.site?` · <a href="${p.site}" rel="noopener nofollow">Site</a>`:''}</span>
</li>`;
  const list=(arr,raw)=>`<ol class="srl">${arr.map((p,i)=>row(p,i+1)).join('')}</ol>
<p class="src">${raw
  ? `Ordered strictly by Google rating, then review count — the raw data, unedited.`
  : `<strong>The guide's ranking.</strong> Our pick leads it; the rest are ordered by a score that weighs the rating against how many people gave it, so a 5.0 from 25 visits sits below a 4.8 from 1,500. Each row shows the untouched Google figures, and the <a href="${LISTING.path}by-google-rating/">raw Google order is published here</a>.`} Snapshot of ${human(PLACES_DATE)}.</p>`;

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
${p.site?`<a class="btn ghost" href="${p.site}" rel="noopener${p.id===FEATURED_ID?'':' nofollow'}">Website</a>`:''}
${p.social?`<a class="btn ghost" href="${p.social}" rel="noopener">Instagram</a>`:''}
${isPick?`<a class="btn" href="${PARTNER.whatsapp}" rel="noopener">Book on WhatsApp</a>`:''}
</p></div>
<div class="biz-map">${gphoto(p,0,'lead')}<iframe title="Map of ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
 src="https://maps.google.com/maps?q=${p.lat},${p.lng}&z=16&output=embed"></iframe></div>
</div>
<div class="biz-g">
<div class="biz-c"><h2>Opening hours</h2>${p.hours&&p.hours.length
  ?`<ul class="hrs">${p.hours.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>`
  :`<p class="m">Not published on Google. Call ahead or message the salon.</p>`}</div>
<div class="biz-c"><h2>What it is</h2>
<p>${esc(p.name)} is ${p.type?`a ${esc(p.type.toLowerCase())}`:`a ${cfg.ITEM_NOUN.toLowerCase()}`} in ${esc(p.area)}, Da Nang, holding ${p.rating} stars across ${p.reviews} public Google reviews.${p.summary?` ${esc(p.summary)}`:''}</p>
${isPick?`<p>${cfg.PICK_TEXT}</p>`:`<p>Before you sit down, run the <a href="${cfg.CHECK_PATH}">${cfg.CHECK_LABEL}</a> — a Google rating measures how people felt, not how the tools were cleaned.</p>`}
<p>What treatments here should cost is on the <a href="/prices/">prices page</a>.</p></div>
</div>
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
          page,head,nav,footer,pick,list,itemList,byGoogle,score,urls,esc,slugify,human,ld,stars,OUT,credits,gphoto,gallery,reviews,readerBlock,READER,AUTHOR,byline,authorLd};
}

module.exports={buildSite,esc,slugify,human,ld,stars,streetOf};
