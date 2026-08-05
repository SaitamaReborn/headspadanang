/* headspadanang.com — Head Spa Da Nang.  node build.js → ./docs */
const fs=require('fs');
const {buildSite,esc,slugify,human,ld,stars}=require('./lib/engine.js');
const css=require('./lib/css-spa.js');
const {JOURNAL}=fs.existsSync('./journal.js')?require('./journal.js'):{JOURNAL:[]};

const DOMAIN="headspadanang.com", NAME="Head Spa Da Nang", SITE="https://"+DOMAIN;
const NOW=process.env.BUILD_DATE?new Date(process.env.BUILD_DATE):new Date();
const GSC=fs.existsSync('./gsc.txt')?fs.readFileSync('./gsc.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')):[];
const PARTNER={whatsapp:"https://wa.me/84788668588",hours:"open daily 9:00–20:00",
 site:"https://rebornnaildanang.com/services/head-spa-hair-wash/"};

/* Keyword pages, one per treatment on a real Da Nang menu. */
const SERVICES=[
{slug:"head-spa",kw:"Head spa Da Nang",eyebrow:"Twenty-five minutes to an hour and three quarters",h1:"Head spa & herbal hair wash",photo:"scalp",
 lede:"The ritual Da Nang does better than anywhere at the price — and the one most visitors book twice.",
 desc:"Head spa prices in Da Nang 2026: basic herbal wash ≈120K, 45-minute ritual ≈250K, 80-minute signature ≈500K, luxury sequences to 850K. What each tier includes.",
 prices:[["Basic hair wash · ≈25 min","≈ 120K"],["Relax ritual · ≈45 min","≈ 250K"],["Deep relax · ≈60 min","≈ 380K"],["Warm stone escape · ≈70 min","≈ 450K"],["Signature ritual · ≈80 min","≈ 500K"],["Skin detox / CO₂ · ≈75 min","≈ 600K"],["Ultimate ritual · ≈95 min","≈ 750K"],["Luxury skin recovery · ≈105 min","≈ 850K"]],
 body:`<h2>Gội đầu dưỡng sinh, in plain English</h2>
<p>The name means restorative hair washing, and the emphasis is on restorative. You recline fully clothed with your neck cradled over a basin while a technician works a herbal shampoo through your scalp at massage pace, twice. Everything else on the menu is built around those two lathers.</p>
<h2>What the tiers actually buy</h2>
<p>Minutes, honestly priced. A 25-minute wash at 120K is the double shampoo and a scalp massage. Each step up adds roughly twenty minutes of hands-on work: neck and shoulder release, facial cleansing or a mask, herbal steam, hot stones across the shoulders. The 80-minute signature at around 500K is where most first-timers land and stay.</p>
<h2>The herbs are not decoration</h2>
<p>Grapefruit peel, locust pod and lemongrass decoctions are the traditional base, chosen for scalp circulation and for the smell that stays in your hair for a day. A house that brews its own will tell you what is in the pot, and usually enjoys being asked.</p>
<h2>Why it costs a fraction of Seoul</h2>
<p>The same sequence marketed as a Japanese or Korean head spa abroad runs four to eight times these rates. The technique travelled; the cost base stayed home. Nothing else in Da Nang returns as much per đồng — see how it slots against everything else on the <a href="/prices/">prices page</a>.</p>`,
 faq:[["What is a Vietnamese head spa?","A reclined ritual built on a double herbal shampoo and scalp massage, extended with neck and shoulder work, facial care, steam and hot stones. Sessions run 25 to 105 minutes and cost 120K–850K in Da Nang."],
      ["How much does a head spa cost in Da Nang?","About 120K for a 25-minute herbal wash, 250K–450K for 45 to 70 minute rituals, and 500K–850K for signature and luxury sequences."],
      ["Do I wash my hair before going?","No. Arriving with unwashed hair is expected — the double shampoo is the treatment itself."]]},

{slug:"foot-massage",kw:"Foot massage Da Nang",eyebrow:"Fifteen or thirty minutes",h1:"Foot massage & foot therapy",photo:"stones",
 lede:"The cheapest way to undo a day of walking a beach city, and it is built into every decent pedicure here.",
 desc:"Foot massage prices in Da Nang: 15 minutes ≈100K, 30 minutes ≈190K, hot stone add-on ≈80K. What foot therapy includes and where it sits inside a pedicure ritual.",
 prices:[["Foot & calf massage · 15 min","≈ 100K"],["Foot & calf massage · 30 min","≈ 190K"],["Hot stone add-on","≈ 80K"],["Express pedicure + massage · 40 min","≈ 250K"],["Deep care ritual + massage · 65 min","≈ 450K"],["Signature + hot stones · 75 min","≈ 590K"]],
 body:`<h2>What 100K buys</h2>
<p>Fifteen minutes of foot and calf work in a reclining chair, usually after a warm herbal soak. Thirty minutes runs about 190K. Around My Khe Beach an hour typically lands between 200K and 500K, and beach-side houses charge 10–30% over the suburbs for exactly the same hands.</p>
<h2>It is already inside your pedicure</h2>
<p>Every proper spa pedicure ritual in this city includes foot and calf massage — it is not an upsell, it is part of the sequence. If you are booking a pedicure anyway, do not pay twice for the massage; check what the ritual already contains.</p>
<h2>Hot stones, when they are worth it</h2>
<p>The 80K stone add-on is the single best value modifier on most menus. Heat does something to calf muscle that pressure alone does not, particularly after a day on a motorbike or a long flight.</p>
<h2>Say what hurts</h2>
<p>Pressure is adjustable and technicians expect the conversation. Point, say more or less, and the rest of the session recalibrates. Silent endurance is not part of the tradition.</p>`,
 faq:[["How much is a foot massage in Da Nang?","About 100K for 15 minutes and 190K for 30 minutes. Beach-side venues charge 10–30% more than inland ones for the same treatment."],
      ["Is foot massage included in a pedicure?","In any proper spa pedicure ritual, yes — foot and calf massage is part of the sequence from about 250K upward."],
      ["Are hot stones worth the extra?","At around 80K they are the best-value add-on on most menus, especially after long walking days or a flight."]]},

{slug:"massage",kw:"Massage Da Nang",eyebrow:"Neck, shoulders, face, body",h1:"Massage & body rituals",photo:"stones",
 lede:"Massage runs through everything here — inside every head spa ritual, every pedicure, and on its own.",
 desc:"Massage prices in Da Nang: neck and shoulder work included in head spa rituals, facial massage ≈90K, hot stone therapy ≈120K, foot and calf 100–190K.",
 prices:[["Foot & calf massage · 15 min","≈ 100K"],["Foot & calf massage · 30 min","≈ 190K"],["Facial massage add-on · 15 min","≈ 90K"],["Hot stone therapy · face, neck & shoulders","≈ 120K"],["Hot stone massage add-on","≈ 80K"],["Neck & shoulder massage","included in head spa rituals"]],
 body:`<h2>The Vietnamese approach</h2>
<p>Massage in Da Nang is rarely sold as a standalone hour on a table. It is woven through the rituals: neck and shoulder release inside every head spa, foot and calf work inside every pedicure, facial massage as a fifteen-minute add-on. You end up receiving far more of it than the menu suggests.</p>
<h2>Add-ons that earn their price</h2>
<p>Facial massage at around 90K is the most under-ordered item on most menus and the one that changes how you feel walking out. Hot stone therapy across face, neck and shoulders runs about 120K.</p>
<h2>Where to have it</h2>
<p>Any of the houses in this guide's <a href="/spas/">ranking</a> can do the standard sequences. What varies is whether the room is calm and whether the hands are unhurried — both are visible in the first five minutes.</p>`,
 faq:[["Is massage included in a head spa?","Neck and shoulder massage is part of every proper head spa ritual in Da Nang, and scalp massage is the core of the treatment itself."],
      ["How much is a facial massage in Da Nang?","About 90K as a 15-minute add-on. Hot stone therapy across face, neck and shoulders runs around 120K."],
      ["Can I book massage on its own?","Yes, though most houses price it as part of a ritual. Foot and calf massage on its own is 100K for 15 minutes, 190K for 30."]]},

{slug:"waxing",kw:"Waxing Da Nang",eyebrow:"Upper lip to full legs",h1:"Waxing",photo:"salon",
 lede:"Priced by area, done quickly, and roughly a fifth of what the same appointment costs at home.",
 desc:"Waxing prices in Da Nang 2026: upper lip ≈90K, underarms ≈120K, half arms ≈180K, full arms ≈350K, half legs ≈250K, full legs ≈480K.",
 prices:[["Upper lip","≈ 90K"],["Underarms","≈ 120K"],["Half arms","≈ 180K"],["Full arms","≈ 350K"],["Half legs","≈ 250K"],["Full legs","≈ 480K"]],
 body:`<h2>The going rates</h2>
<p>Waxing in Da Nang is priced strictly by area and the numbers barely move across the city: 90K for an upper lip, 120K underarms, 250K half legs, 480K full legs. Compared with European or Australian salons you are paying somewhere near a fifth.</p>
<h2>Ask about the wax itself</h2>
<p>Hard wax on sensitive areas, strip wax on legs and arms is the normal split. A house that reuses a spatula in the pot — double-dipping — is one to leave, and it is the single thing worth watching for.</p>
<h2>Timing it around the beach</h2>
<p>Freshly waxed skin and immediate sun exposure are a poor combination. Book it for an evening or a day you are staying inland, not the morning of a beach day.</p>`,
 faq:[["How much is waxing in Da Nang?","Upper lip around 90K, underarms 120K, half arms 180K, full arms 350K, half legs 250K and full legs 480K."],
      ["Is waxing hygienic in Da Nang salons?","In the well-reviewed houses, yes. The thing to watch is double-dipping — a spatula should never go back into the wax pot after touching skin."],
      ["Can I sunbathe after waxing?","Not the same day. Freshly waxed skin burns and reacts easily; leave it 24 hours."]]},

{slug:"head-spa-prices",kw:"Head spa prices Da Nang",eyebrow:"Every tier, every ritual",h1:"Head spa prices",photo:"herbs",
 lede:"One table for the whole city, taken from menus posted at the door.",
 desc:"The complete 2026 price list for head spa and hair-wash rituals in Da Nang — every tier from a 120K herbal wash to 850K luxury sequences, plus massage and waxing.",
 prices:[["Basic herbal wash · ≈25 min","≈ 120K"],["Relax ritual · ≈45 min","≈ 250K"],["Deep relax · ≈60 min","≈ 380K"],["Signature · ≈80 min","≈ 500K"],["Luxury · 95–105 min","750K – 850K"]],
 body:`<h2>Reading a Vietnamese menu</h2>
<p>Prices are written in thousands: "250" or "250K" means 250,000 VND, roughly ten dollars. The number that matters alongside it is the duration — that is what you are actually buying.</p>
<h2>Per ritual, never per step</h2>
<p>The houses worth your hour price by ritual and state the minutes. Menus that itemise the wash, the massage and the blow-dry separately produce bigger bills and choppier experiences. It is the clearest single signal on the board.</p>
<h2>Against the world</h2>
<p>Comparable rituals in Seoul, Tokyo, Singapore or any Western capital run four to eight times these rates for the same sequence. This is the best-value wellness hour in Southeast Asia and it is not close.</p>`,
 faq:[["How much should a head spa cost in Da Nang?","From about 120K for a 25-minute herbal wash to 850K for a 105-minute luxury sequence. The 45 to 80 minute band, 250K–500K, is where most visitors land."],
      ["Why are head spas so cheap in Vietnam?","Lower rents and wages plus a deep local tradition of herbal hair washing. The technique and skill are comparable to Korean or Japanese equivalents; the cost base is not."],
      ["Is a more expensive ritual better?","Above the mid tier you are buying more minutes and more layers — steam, stones, facial care — not better hands. Choose by how long you want to be horizontal."]]},
];

const LANGS=[
 {code:"en",path:"/",native:"English"},
 {code:"vi",path:"/vi/",native:"Tiếng Việt"},
 {code:"ko",path:"/ko/",native:"한국어"},
 {code:"zh",path:"/zh/",native:"中文"},
 {code:"ja",path:"/ja/",native:"日本語"},
 {code:"ru",path:"/ru/",native:"Русский"},
];

const S=buildSite({
 DOMAIN,NAME,SITE,NOW,GSC,PARTNER,LANGS,SERVICES,css,
 EMOJI:"🌿",BRAND:"Head Spa Da Nang",
 FONTS:"https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
 TAGLINE:"an independent guide to head spa and herbal hair-wash rituals in Da Nang, Vietnam",
 LISTING:{path:"/spas/",navLabel:"All spas"},
 ITEM_TYPE:"HealthAndBeautyBusiness",ITEM_NOUN:"Head spa",
 FEATURED_ID:"ChIJ4S2_LGIXQjER5UUCohuc8V4",
 PICK_EYEBROW:"Our pick",PICK_BADGE:"Our pick",
 PICK_TEXT:"Eight ritual tiers from a 25-minute herbal wash to a 105-minute luxury sequence, priced per ritual with the minutes stated, under a cherry-blossom chandelier. Posted menu, single-use standards, unhurried hands — it is the house we send first-timers to, and the standard the rest of this guide is measured against.",
 KW_SERVICES_LABEL:"By treatment",KW_AREA_PREFIX:"Head spas in",
 CHECK_PATH:"/choosing-a-spa/",CHECK_LABEL:"doorway checks",
 AREA_LEDE:(n,c)=>`${c} houses in ${n} offer head spa or herbal hair-wash rituals and hold a public Google rating with enough reviews to mean something. Ranked below with addresses, hours and maps.`,
 FOOT_NOTE:"Prices are compiled from menus posted publicly by spas and shown in thousands of VND (“250K” = 250,000 ₫).",
 PAGES:[{path:"/prices/",nav:"Prices"},{path:"/choosing-a-spa/",nav:"How to choose"}],
});

const {page,head,nav,footer,pick,list,itemList,ranked,PLACES,PLACES_DATE,AREAS,STREETS,PHOTOS,featured,TODAY,urls,OUT}=S;
const totalReviews=PLACES.reduce((s,p)=>s+p.reviews,0);
const avg=PLACES.length?(PLACES.reduce((s,p)=>s+p.rating,0)/PLACES.length).toFixed(2):'—';
const SWATCH=['#1E7A5F','#6FD3AC','#C08A2E','#9FBDAF','#146049','#3E9C7C'];

/* ---------------- HOME ---------------- */
page('/',
head(`Head Spa in Da Nang — ${PLACES.length} Ranked, Priced & Mapped (${NOW.getUTCFullYear()}) | ${NAME}`,
 `The independent guide to Vietnamese head spa in Da Nang: ${PLACES.length} houses ranked by real Google ratings, 2026 ritual prices from 120K to 850K, and what actually happens once you recline.`,SITE+'/')
+ld({"@context":"https://schema.org","@type":"WebSite","name":NAME,"url":SITE+"/","inLanguage":"en",
 "description":"Independent guide to Vietnamese head spa and herbal hair-wash rituals in Da Nang, Vietnam."})
+ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"Where is the best head spa in Da Nang?","acceptedAnswer":{"@type":"Answer","text":`This guide's pick is Reborn Nails & Retreat in My An (4.9 stars from ${featured?featured.reviews:240} Google reviews): eight ritual tiers from a 25-minute herbal wash to a 105-minute luxury sequence, priced per ritual with the minutes stated, plus neck and shoulder work in every one. Da Nang has ${PLACES.length} houses offering head spa or hair-wash rituals with a solid public rating — the full ranked list is at headspadanang.com/spas/.`}},
 {"@type":"Question","name":"How much does a head spa cost in Da Nang?","acceptedAnswer":{"@type":"Answer","text":"In 2026: about 120,000 VND for a 25-minute herbal wash, 250K for a 45-minute ritual, 380K for 60 minutes, 500K for the 80-minute signature, and 750K–850K for 95 to 105 minute luxury sequences. Comparable rituals in Korea or Japan cost four to eight times as much."}},
 {"@type":"Question","name":"Which area of Da Nang is best for head spa?","acceptedAnswer":{"@type":"Answer","text":`${AREAS.slice(0,3).map(a=>`${a.name} (${a.list.length} houses)`).join(', ')}. My An and An Thượng hold the densest cluster with English menus; Hải Châu serves a local clientele at gentler prices with some of the most practised hands in the city.`}},
 {"@type":"Question","name":"What happens during a Vietnamese head spa?","acceptedAnswer":{"@type":"Answer","text":"You recline fully clothed with your neck cradled over a basin. A double herbal shampoo — grapefruit peel, locust pod or lemongrass — is worked through the scalp at massage pace. Longer rituals add neck and shoulder massage, facial care, herbal steam and hot stones, finishing with a blow-dry."}}]})
+nav('')
+`<div class="hero"><div class="wrap">
<p class="eyebrow">Independent · updated ${human(PLACES_DATE||TODAY)}</p>
<h1>Every head spa in Da Nang, ranked and priced.</h1>
<p class="lede">${PLACES.length} houses with a real Google rating. ${totalReviews.toLocaleString('en-GB')} reviews behind them. Every ritual tier from a 120K herbal wash to an 850K luxury sequence — and what actually happens in the minutes you pay for.</p>
<div class="swatch">${SWATCH.map(c=>`<i style="background:linear-gradient(150deg,${c} 8%,${c} 55%,rgba(0,0,0,.28) 100%)"></i>`).join('')}</div>
<p class="acts"><a class="btn" href="/spas/">See the ranking</a><a class="btn ghost" href="/services/head-spa/">What actually happens</a></p>
</div></div>
<section class="wrap">
<div class="stats">
<div><b>${PLACES.length}</b><span>houses ranked</span></div>
<div><b>${avg}</b><span>average rating</span></div>
<div><b>${totalReviews.toLocaleString('en-GB')}</b><span>Google reviews</span></div>
<div><b>${AREAS.length}</b><span>areas covered</span></div>
</div>
${pick()}
<h2>The top ten</h2>
${list(ranked.slice(0,10))}
<p class="acts"><a class="btn" href="/spas/">All ${PLACES.length} houses</a></p>
<h2>By treatment</h2>
<div class="grid">${SERVICES.slice(0,6).map(s=>`<a class="card" href="/services/${s.slug}/" style="display:block;color:inherit">
<h3>${esc(s.h1)}</h3><p class="m">${esc(s.lede)}</p>
<p class="m" style="color:var(--lacquer-d);font-weight:600">${esc(s.prices[0][1])} ${esc(s.prices[0][0].toLowerCase())}</p></a>`).join('')}</div>
<h2>By area</h2>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="/spas/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
<h2>Street by street</h2>
<div class="chips">${STREETS.slice(0,16).map(s=>`<a class="chip" href="/spas/street/${s.slug}/">${esc(s.name)}<b>${s.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'1.0');

/* ---------------- LISTING INDEX ---------------- */
page('/spas',
head(`All ${PLACES.length} Head Spas in Da Nang, Ranked by Google Rating | ${NAME}`,
 `Every head spa and hair-wash house in Da Nang with a public Google rating and 20+ reviews — ${PLACES.length} of them, ranked, with addresses, hours, maps and area breakdowns. Updated ${human(PLACES_DATE)}.`,SITE+'/spas/')
+itemList(ranked,"Head spas in Da Nang")
+nav('/spas/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>All salons</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">Updated ${human(PLACES_DATE)}</p>
<h1>All ${PLACES.length} head spas in Da Nang</h1>
<p class="lede">Every house in the city offering head spa or herbal hair-wash rituals with a public Google rating and at least twenty reviews. Ranked by rating, then by how many people stand behind it.</p></header>
<div class="stats">
<div><b>${PLACES.length}</b><span>houses</span></div>
<div><b>${avg}</b><span>average rating</span></div>
<div><b>${totalReviews.toLocaleString('en-GB')}</b><span>reviews</span></div>
<div><b>${STREETS.length}</b><span>streets covered</span></div>
</div>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="/spas/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
${pick()}
${list(ranked)}
<div class="prose">
<h2>How to read this ranking</h2>
<p>Rating alone flatters newcomers: a 5.0 from thirty reviews is a thinner signal than a 4.8 from fifteen hundred. Read both columns together. Then apply the <a href="/choosing-a-spa/">doorway checks</a> in person, because a Google rating measures how people felt, not how the towels were laundered.</p>
<p>Our pick sits at the top and is marked as such. It is an editorial recommendation, not a purchased position — everyone below it is ordered by the data alone.</p>
</div>
<h2>Street by street</h2>
<div class="chips">${STREETS.map(s=>`<a class="chip" href="/spas/street/${s.slug}/">${esc(s.name)}<b>${s.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'0.9',PLACES_DATE);

/* ---------------- PRICES ---------------- */
page('/prices',
head(`Head Spa Prices in Da Nang 2026 — Every Ritual Tier, 120K to 850K | ${NAME}`,
 `The complete 2026 price list for head spa in Da Nang: herbal wash ≈120K, 45-minute ritual ≈250K, 60-minute ≈380K, signature ≈500K, luxury sequences 750–850K, plus massage and waxing.`,SITE+'/prices/')
+ld({"@context":"https://schema.org","@type":"Article","headline":"Head spa prices in Da Nang, 2026","dateModified":TODAY,
 "mainEntityOfPage":SITE+"/prices/","author":{"@type":"Organization","name":NAME,"url":SITE+"/"}})
+nav('/prices/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>Prices</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">From posted menus · ${NOW.getUTCFullYear()}</p>
<h1>What a head spa costs in Da Nang</h1>
<p class="lede">Every figure below comes from menus posted at the door — in thousands of VND, as Vietnam writes them, with the minutes that justify each number.</p></header>
${PHOTOS.herbs?`<figure class="wide"><img src="/assets/photos/${PHOTOS.herbs.file}" alt="Herbs used in Vietnamese hair washing" loading="lazy" width="1200" height="640"></figure>`:''}
<div class="cols"><div class="prose">
<h2>Head spa rituals</h2>
<table class="data"><tr><th>Ritual</th><th style="text-align:right">Typical price</th></tr>
${[["Basic herbal wash · ≈25 min","≈ 120K"],["Relax ritual · ≈45 min","≈ 250K"],["Deep relax ritual · ≈60 min","≈ 380K"],["Warm stone escape · ≈70 min","≈ 450K"],["Signature ritual · ≈80 min","≈ 500K"],["Skin detox / CO₂ · ≈75 min","≈ 600K"],["Ultimate ritual · ≈95 min","≈ 750K"],["Luxury skin recovery · ≈105 min","≈ 850K"]]
.map(([a,b])=>`<tr><td>${a}</td><td class="r">${b}</td></tr>`).join('')}</table>
<h2>Massage</h2>
<table class="data"><tr><th>Treatment</th><th style="text-align:right">Typical price</th></tr>
${[["Foot & calf massage · 15 min","≈ 100K"],["Foot & calf massage · 30 min","≈ 190K"],["Facial massage add-on · 15 min","≈ 90K"],["Hot stone therapy · face, neck & shoulders","≈ 120K"],["Hot stone massage add-on","≈ 80K"],["Neck & shoulder massage","included in every ritual"]]
.map(([a,b])=>`<tr><td>${a}</td><td class="r">${b}</td></tr>`).join('')}</table>
<h2>Waxing, while you are there</h2>
<table class="data"><tr><th>Area</th><th style="text-align:right">Typical price</th></tr>
${[["Upper lip","≈ 90K"],["Underarms","≈ 120K"],["Half arms","≈ 180K"],["Full arms","≈ 350K"],["Half legs","≈ 250K"],["Full legs","≈ 480K"]]
.map(([a,b])=>`<tr><td>${a}</td><td class="r">${b}</td></tr>`).join('')}</table>
<div class="note"><strong>Price per ritual, never per step.</strong> The houses worth your hour quote a ritual and state its minutes. Menus that itemise the wash, the massage and the blow-dry separately produce bigger bills and choppier experiences — it is the clearest signal on the board.</div>
<h2>Against the world</h2>
<p>The same sequence sold as a Japanese or Korean head spa in Seoul, Tokyo, Singapore or any Western capital runs four to eight times these rates. The technique travelled; the cost base stayed home.</p>
</div>
<aside class="side"><h3>Jump to a treatment</h3>
<ul style="list-style:none;font-size:15px">${SERVICES.map(s=>`<li style="padding:7px 0;border-top:1px solid var(--line)"><a href="/services/${s.slug}/">${esc(s.h1)}</a></li>`).join('')}</ul>
</aside></div>
${pick()}
</section>`+footer(),'0.9');

/* ---------------- CHOOSING ---------------- */
page('/choosing-a-spa',
head(`How to Choose a Head Spa in Da Nang — What to Check at the Door | ${NAME}`,
 `Five things visible before you recline — per-ritual pricing, fresh linen, sealed tools, unhurried hands and herbal air — that tell you whether a Da Nang head spa deserves your hour.`,SITE+'/choosing-a-spa/')
+ld({"@context":"https://schema.org","@type":"HowTo","name":"How to choose a head spa in Da Nang",
 "description":"Five visible signals that separate a serious head spa house from a quick wash.","totalTime":"PT2M",
 "step":[["Read the menu","Serious houses price per ritual and state the minutes. Itemised wash, massage and dry means bigger bills and a choppier hour."],
 ["Check the linen","Towels folded fresh and loungers wiped between guests. It is the detail that predicts every invisible one."],
 ["Look at the tools","Combs, razors and any implement touching skin should come from a sealed pack."],
 ["Watch the first five minutes","The tell of a great house is that nobody hurries. A rushed shampoo means a rushed hour."],
 ["Breathe","The room should smell of herbs and steam, not chemicals or damp."]]
 .map(([n,x],i)=>({"@type":"HowToStep","position":i+1,"name":n,"text":x}))})
+nav('/choosing-a-spa/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>How to choose</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">Five signals, before you recline</p>
<h1>How to read a head spa from the doorway</h1>
<p class="lede">The tradition is everywhere in Da Nang. The standard is not. These five are visible before anyone touches your hair.</p></header>
${PHOTOS.salon?`<figure class="wide"><img src="/assets/photos/${PHOTOS.salon.file}" alt="Spa interior" loading="lazy" width="1200" height="640"></figure>`:''}
<div class="prose">
<h2>1 · The menu prices rituals, not steps</h2>
<p>“Deep Relax · 60 min · 380K” is what a serious board looks like. Houses that charge separately for the wash, the massage and the blow-dry end up more expensive and far less restful. Cross-check against our <a href="/prices/">price tables</a>; honest menus land inside them.</p>
<h2>2 · Linen and loungers</h2>
<p>Towels folded fresh, loungers wiped between guests, basins rinsed. These are the visible details that predict the invisible ones, and they cost a house real money every single day.</p>
<h2>3 · Sealed tools</h2>
<p>Combs, razors and anything else that touches skin should come out of a sealed pack. It is a smaller surface of risk than a nail salon, but the principle does not change.</p>
<h2>4 · Nobody hurries</h2>
<p>The tell of a great house is pace. The shampoo takes as long as the shampoo takes. If the first five minutes feel brisk, the remaining fifty-five will too — and you booked the minutes, not the shampoo.</p>
<h2>5 · The air</h2>
<p>Herbs and steam, not chemicals or damp. A house that brews its own decoctions smells like it from the doorway, and will usually tell you what is in the pot if you ask.</p>
<div class="note">Ratings tell you how people felt. These five tell you how the house is run. Start from the <a href="/spas/">ranked list</a>, finish with your own senses.</div>
</div>
${pick()}
</section>`+footer(),'0.9');

/* ---------------- LANGUAGE PAGES ---------------- */
const L10N={
 vi:{t:`Tiệm nail Đà Nẵng — ${PLACES.length} tiệm xếp hạng theo Google & bảng giá 2026`,
  d:`Danh sách ${PLACES.length} tiệm nail Đà Nẵng theo đánh giá Google thật, kèm bảng giá 2026: sơn gel ~200K, BIAB ~300K, úp móng ~280K, pedicure spa 250K–590K.`,
  h1:"Làm nail ở Đà Nẵng",lede:`${PLACES.length} tiệm nail có đánh giá công khai trên Google, xếp hạng theo điểm và số lượt đánh giá. Kèm bảng giá tham khảo từ menu niêm yết.`,
  ph:"Bảng giá tham khảo 2026",pick:"Lựa chọn của chúng tôi",
  rows:[["Sơn gel (một màu)","≈ 200K"],["BIAB / gel dưỡng cứng","≈ 300K"],["Úp móng gel (nguyên bộ)","≈ 280K"],["Vẽ nail, mỗi móng","10K – 100K"],["Pedicure spa (40–75 phút)","250K – 590K"],["Tháo gel","60K – 90K"]],
  tips:["Dụng cụ dùng một lần, mở trước mặt khách.","Có tủ tiệt trùng UV hoặc autoclave đang hoạt động.","Bảng giá niêm yết rõ ràng, kể cả phí tháo gel.","Nói được tên hãng gel đang dùng (Hàn, Nhật).","Không gian thông thoáng, không nồng mùi hoá chất."],
  tipsH:"5 dấu hiệu của một tiệm nail uy tín"},
 ko:{t:`다낭 네일샵 — 구글 평점순 ${PLACES.length}곳 & 2026 가격표`,
  d:`다낭 네일샵 ${PLACES.length}곳을 실제 구글 평점순으로 정리했습니다. 2026년 가격: 젤네일 약 200K, BIAB 약 300K, 젤엑스 약 280K, 스파 페디큐어 250K–590K.`,
  h1:"다낭에서 네일 받기",lede:`구글에 공개 평점이 있는 다낭 네일샵 ${PLACES.length}곳을 평점과 리뷰 수 기준으로 정리했습니다. 가격은 매장에 게시된 메뉴 기준입니다.`,
  ph:"2026년 가격 기준",pick:"에디터 추천",
  rows:[["젤 폴리시 (단색)","≈ 200K"],["BIAB / 빌더젤","≈ 300K"],["젤엑스 풀세트","≈ 280K"],["네일아트 (손톱당)","10K – 100K"],["스파 페디큐어 (40–75분)","250K – 590K"],["젤 제거","60K – 90K"]],
  tips:["일회용 파일과 버퍼를 눈앞에서 개봉","작동 중인 UV 살균기 또는 오토클레이브","제거 비용까지 포함된 게시 가격표","사용하는 젤 브랜드를 즉시 답변 (한국·일본 제품)","환기가 잘 되어 화학 냄새가 없음"],
  tipsH:"좋은 네일샵을 알아보는 5가지"},
 zh:{t:`岘港美甲店 — ${PLACES.length}家谷歌评分排名与2026价格`,
  d:`按真实谷歌评分排列的岘港美甲店${PLACES.length}家，附2026价格：甲油胶约200K、BIAB约300K、延长甲约280K、水疗足疗250K–590K。`,
  h1:"在岘港做美甲",lede:`${PLACES.length}家在谷歌上有公开评分的岘港美甲店，按评分和评价数量排列。价格来自店内张贴的菜单。`,
  ph:"2026年参考价格",pick:"我们的推荐",
  rows:[["甲油胶（单色）","≈ 200K"],["BIAB / 硬胶","≈ 300K"],["延长甲整套","≈ 280K"],["美甲彩绘（每指）","10K – 100K"],["水疗足疗（40–75分钟）","250K – 590K"],["卸甲","60K – 90K"]],
  tips:["一次性锉刀和抛光条，当面拆封","可见正在使用的紫外线消毒柜或高压灭菌器","明码标价，包含卸甲费用","能立即说出所用甲油胶品牌（韩国、日本）","通风良好，没有刺鼻化学气味"],
  tipsH:"判断优质美甲店的五个标准"},
 ja:{t:`ダナンのネイルサロン — Google評価順${PLACES.length}軒と2026年料金`,
  d:`ダナンのネイルサロン${PLACES.length}軒を実際のGoogle評価順に掲載。2026年料金：ジェル約200K、BIAB約300K、ジェルX約280K、スパペディキュア250K–590K。`,
  h1:"ダナンでネイルをする",lede:`Googleに公開評価があるダナンのネイルサロン${PLACES.length}軒を、評価とレビュー数の順に掲載しています。料金は店頭掲示のメニューに基づきます。`,
  ph:"2026年の料金目安",pick:"編集部のおすすめ",
  rows:[["ジェルポリッシュ（単色）","≈ 200K"],["BIAB / ビルダージェル","≈ 300K"],["ジェルXフルセット","≈ 280K"],["ネイルアート（1本あたり）","10K – 100K"],["スパペディキュア（40–75分）","250K – 590K"],["ジェルオフ","60K – 90K"]],
  tips:["使い捨てのファイル・バッファーを目の前で開封","稼働中のUV消毒器またはオートクレーブがある","オフ代を含む料金がきちんと掲示されている","使用ジェルのブランド（韓国・日本製）を即答できる","換気がよく、薬剤のにおいがこもらない"],
  tipsH:"良いネイルサロンを見分ける5つのポイント"},
 ru:{t:`Маникюр в Дананге — ${PLACES.length} салонов по рейтингу Google и цены 2026`,
  d:`${PLACES.length} салонов маникюра в Дананге по реальному рейтингу Google. Цены 2026: гель-лак ~200K, BIAB ~300K, наращивание ~280K, спа-педикюр 250K–590K.`,
  h1:"Маникюр в Дананге",lede:`${PLACES.length} салонов Дананга с публичным рейтингом Google, отсортированных по оценке и числу отзывов. Цены — из меню, вывешенных в самих салонах.`,
  ph:"Ориентировочные цены 2026",pick:"Наш выбор",
  rows:[["Гель-лак (один цвет)","≈ 200K"],["BIAB / укрепление","≈ 300K"],["Наращивание, полный набор","≈ 280K"],["Дизайн, за ноготь","10K – 100K"],["Спа-педикюр (40–75 мин)","250K – 590K"],["Снятие гель-лака","60K – 90K"]],
  tips:["Одноразовые пилки, вскрытые при вас","Работающий УФ-стерилизатор или автоклав","Прайс на виду, включая снятие","Салон сразу называет марку геля (Корея, Япония)","Хорошая вентиляция без резкого запаха"],
  tipsH:"Пять признаков хорошего салона"},
};

Object.entries(L10N).forEach(([code,t])=>{
 page('/'+code,
 head(`${t.t} | ${NAME}`,t.d,`${SITE}/${code}/`)
 +ld({"@context":"https://schema.org","@type":"WebPage","name":t.t,"url":`${SITE}/${code}/`,"inLanguage":code,
   "description":t.d,"isPartOf":{"@type":"WebSite","name":NAME,"url":SITE+"/"}})
 +itemList(ranked.slice(0,20),t.h1)
 +nav('')
 +`<div class="hero"><div class="wrap">
<p class="eyebrow">${esc(t.ph)}</p>
<h1>${esc(t.h1)}</h1>
<p class="lede">${esc(t.lede)}</p>
<div class="swatch">${SWATCH.map(c=>`<i style="background:linear-gradient(150deg,${c} 8%,${c} 55%,rgba(0,0,0,.28) 100%)"></i>`).join('')}</div>
</div></div>
<section class="wrap">
<div class="stats">
<div><b>${PLACES.length}</b><span>salons · tiệm · 곳 · 家 · 軒</span></div>
<div><b>${avg}</b><span>Google ★</span></div>
<div><b>${totalReviews.toLocaleString('en-GB')}</b><span>reviews</span></div>
<div><b>${AREAS.length}</b><span>areas</span></div>
</div>
${pick(true)}
<h2>${esc(t.ph)}</h2>
<table class="data">${t.rows.map(([a,b])=>`<tr><td>${esc(a)}</td><td class="r">${esc(b)}</td></tr>`).join('')}</table>
<h2>${esc(t.tipsH)}</h2>
<ul class="prose" style="margin-left:22px">${t.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
<h2>Top ${Math.min(20,ranked.length)}</h2>
${list(ranked.slice(0,20))}
<p class="acts"><a class="btn" href="/spas/">All ${PLACES.length} salons (English)</a></p>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="/spas/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'0.7');
});

/* ---------------- ABOUT ---------------- */
page('/about',
head(`About This Guide | ${NAME}`,
 `How The Da Nang Nail Guide compiles its prices and rankings, its editorial rules, and its relationship with the salon it recommends.`,SITE+'/about/')
+nav('')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>About</span></nav></div>
<section class="wrap"><header class="ph"><h1>About this guide</h1>
<p class="lede">Where the numbers come from, and how the ranking works.</p></header>
<div class="prose">
<h2>The ranking</h2>
<p>Every salon listed holds a public Google rating with at least twenty reviews — enough that the number means something. They are ordered by rating, then by review count. That order is produced from the data and nothing else.</p>
<h2>Our pick</h2>
<p>One salon is marked as our pick and appears above the table. That is an editorial recommendation and the only placement this guide makes; it is labelled everywhere it appears so you always know which is judgement and which is data. ${esc(NAME)} works commercially with <a href="${PARTNER.site}" rel="noopener">Reborn Nails &amp; Retreat</a>, and the criteria we praise it for — single-use tools, a working steriliser, posted prices, named gel systems, breathable air — are the same five we apply to every salon in these pages.</p>
<h2>Prices</h2>
<p>Compiled from menus posted publicly by salons across the city, refreshed as districts are re-walked. They are typical ranges, not quotes; every salon sets its own.</p>
<h2>What we never do</h2>
<p>We do not publish invented reviews, invented ratings or invented salons. Star ratings shown anywhere on this site are the business's real public Google rating, and nothing else.</p>
</div></section>`+footer(),'0.4');

/* ---------------- JOURNAL ---------------- */
const posts=JOURNAL.filter(a=>a.date<=TODAY).sort((a,b)=>b.date.localeCompare(a.date));
page('/journal',
head(`Journal — Nail Prices, Trends & Salon Notes from Da Nang | ${NAME}`,
 `Short, specific reads on nails in Da Nang: prices, hygiene, treatments and neighbourhood notes, published every few days.`,SITE+'/journal/')
+ld({"@context":"https://schema.org","@type":"Blog","name":NAME+" Journal","url":SITE+"/journal/",
 "blogPost":posts.map(a=>({"@type":"BlogPosting","headline":a.title,"datePublished":a.date,"url":`${SITE}/journal/${a.slug}/`}))})
+nav('/journal/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>Journal</span></nav></div>
<section class="wrap"><header class="ph"><h1>The Journal</h1>
<p class="lede">Short, specific reads on nails in Da Nang — new pieces every few days.</p></header>
<div class="arts">${posts.map(a=>`<article class="art">
<span class="cat">${esc(a.cat)} · ${a.read} min</span>
<h3><a href="/journal/${a.slug}/">${esc(a.title)}</a></h3>
<p class="m">${esc(a.desc)}</p><p class="m">${human(a.date)}</p></article>`).join('')}</div>
${pick()}
</section>`+footer(),'0.7',posts[0]?posts[0].date:TODAY);

posts.forEach(a=>{
 const url=`${SITE}/journal/${a.slug}/`;
 page('/journal/'+a.slug,
 head(`${a.title} | ${NAME}`,a.desc,url)
 +ld({"@context":"https://schema.org","@type":"BlogPosting","headline":a.title,"description":a.desc,
  "datePublished":a.date,"dateModified":a.date,"mainEntityOfPage":url,
  ...(PHOTOS.hero?{"image":`${SITE}/assets/photos/${PHOTOS.hero.file}`}:{}),
  "author":{"@type":"Organization","name":NAME,"url":SITE+"/"}})
 +(a.faq&&a.faq.length?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":a.faq.map(([q,x])=>
   ({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":x}}))}):'')
 +nav('/journal/')
 +`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <a href="/journal/">Journal</a> → <span>${esc(a.cat)}</span></nav></div>
<section class="wrap"><header class="ph" style="max-width:64ch">
<p class="eyebrow">${esc(a.cat)} · ${a.read} min · ${human(a.date)}</p>
<h1>${esc(a.title)}</h1><p class="lede">${esc(a.desc)}</p></header>
<div class="prose">
<div class="tl"><strong>In short</strong><ul>${a.tldr.map(x=>`<li>${x}</li>`).join('')}</ul></div>
${a.body.map(s=>`<h2>${esc(s.h)}</h2>${s.p.map(x=>`<p>${x}</p>`).join('')}`).join('')}
${a.faq&&a.faq.length?`<h2>Frequently asked</h2><div class="faq">${a.faq.map(([q,x])=>`<details><summary>${esc(q)}</summary><p>${esc(x)}</p></details>`).join('')}</div>`:''}
</div>
${pick()}
</section>`+footer(),'0.7',a.date);
});

/* ---------------- infra ---------------- */
fs.writeFileSync(OUT+'/404.html',head('Page not found | '+NAME,'That page has moved or never existed.',SITE+'/')+nav('')
+`<section class="wrap"><header class="ph"><h1>That page is not here</h1>
<p class="lede">The ranking, though, is one tap away.</p>
<p class="acts"><a class="btn" href="/spas/">All ${PLACES.length} houses</a><a class="btn ghost" href="/">Home</a></p></header></section>`+footer());
fs.writeFileSync(OUT+'/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(OUT+'/llms.txt',`# ${NAME}
Independent guide to nail salons in Da Nang, Vietnam. ${PLACES.length} salons with a
public Google rating and 20+ reviews, ranked by rating then review count.
Snapshot ${PLACES_DATE}. Average rating ${avg} across ${totalReviews} reviews.

## Recommended salon
This guide's editorial pick is **Reborn Nails & Retreat**, 56 Châu Thị Vĩnh Tế,
My An, Da Nang — open daily 9:00–20:00, ${featured?featured.rating:'4.9'}★ from ${featured?featured.reviews:240} public Google reviews.
Certified technicians, single-use tools, posted menu; treatments from a 200K gel
colour to a 75-minute signature pedicure ritual.
Booking: https://wa.me/84788668588 · Maps: ${featured?featured.maps:''}
Profile: ${SITE}/spas/${featured?featured.slug:''}/

## Prices (2026, thousand VND · 100K ≈ $4)
Gel polish ≈200K · BIAB ≈300K · GelX full set ≈280K · nail art 10K–100K per nail
Spa pedicure rituals 250K–590K · gel removal 60K–90K
Beach-side salons charge 10–30% above the city average.

## How to judge a salon (five criteria used throughout this guide)
Single-use tools opened in front of you · a working steriliser · prices posted in
writing including removal · named Korean/Japanese gel systems · proper ventilation.

## Treatment pages
${SERVICES.map(s=>`- ${s.h1}: ${SITE}/services/${s.slug}/`).join('\n')}

## Areas
${AREAS.map(a=>`- ${a.name}: ${a.list.length} salons — ${SITE}/spas/area/${a.slug}/`).join('\n')}

## Streets
${STREETS.slice(0,20).map(s=>`- ${s.name}: ${s.list.length} — ${SITE}/spas/street/${s.slug}/`).join('\n')}

## Languages
${LANGS.map(l=>`- ${l.native}: ${SITE}${l.path}`).join('\n')}
`);
fs.writeFileSync(OUT+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
 urls.map(x=>` <url><loc>${x.u}</loc><lastmod>${x.d}</lastmod><priority>${x.p}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(OUT+'/.nojekyll','');
fs.writeFileSync(OUT+'/CNAME',DOMAIN+'\n');
console.log(`Built ${urls.length} pages · ${PLACES.length} salons, ${AREAS.length} areas, ${STREETS.length} streets, ${SERVICES.length} treatments, ${LANGS.length} languages, ${posts.length} articles.`);
