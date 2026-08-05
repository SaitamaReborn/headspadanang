/* Head Spa Da Nang · headspadanang.com · static generator (zero deps)
   node build.js → ./docs · journal is date-gated (drip publishing). */
const fs=require('fs');
const {JOURNAL}=fs.existsSync('./journal.js')?require('./journal.js'):{JOURNAL:[]};

const DOMAIN="headspadanang.com";
const SITE="https://"+DOMAIN;
const NAME="Head Spa Da Nang";
const NOW=process.env.BUILD_DATE?new Date(process.env.BUILD_DATE):new Date();
const TODAY=NOW.toISOString().slice(0,10);
const GSC=fs.existsSync('./gsc.txt')?fs.readFileSync('./gsc.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')):[];

/* Featured house · real, publicly verifiable facts only. */
const PARTNER={name:"Reborn Nails & Retreat",street:"56 Châu Thị Vĩnh Tế",area:"My An, Ngũ Hành Sơn",
 rating:"4.9",count:"150+",hours:"Open daily 9:00 AM – 8:00 PM",
 maps:"https://maps.google.com/?cid=6841420951448602085",
 site:"https://rebornnaildanang.com/services/head-spa-hair-wash/",whatsapp:"https://wa.me/84788668588"};

const OUT='./docs';
fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT+'/assets',{recursive:true});

const ld=o=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const human=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});

fs.writeFileSync(OUT+'/assets/style.css',`
:root{--bg:#F7F4EC;--ink:#17281F;--deep:#1E3A2F;--mut:#5D6B5F;--gold:#B08D4A;--line:#E0DACC;--card:#FFFEF9}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:17px/1.7 "Jost",-apple-system,system-ui,sans-serif}
h1,h2,h3,.brand{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;line-height:1.12}
h1{font-size:clamp(38px,6.5vw,64px);letter-spacing:-.01em}
h2{font-size:clamp(26px,3.6vw,38px);margin:2.2em 0 .55em}
h3{font-size:22px;margin:1.4em 0 .35em}
p{margin:.8em 0}
a{color:var(--deep);text-decoration:underline;text-decoration-color:var(--gold);text-underline-offset:3px}
a:hover{color:var(--gold)}
.wrap{max-width:980px;margin:0 auto;padding:0 22px}
.nav{background:var(--deep);color:#EFEAD9;position:sticky;top:0;z-index:9}
.navin{display:flex;align-items:center;gap:24px;padding:15px 0;flex-wrap:wrap}
.brand{font-size:22px;color:#fff;text-decoration:none}
.brand i{color:var(--gold);font-style:normal}
.navlinks{display:flex;gap:20px;flex-wrap:wrap;font-size:15px;margin-left:auto}
.navlinks a{color:#EFEAD9;text-decoration:none}.navlinks a.on,.navlinks a:hover{color:var(--gold)}
.hero{text-align:center;padding:84px 0 66px;
 background:radial-gradient(50% 80% at 50% 0%,#EAE2CE 0%,transparent 70%),var(--bg)}
.kick{color:var(--gold);text-transform:uppercase;letter-spacing:.22em;font-size:12.5px;font-weight:600;margin-bottom:16px}
.sub{color:var(--mut);font-size:19px;max-width:620px;margin:16px auto 0}
.rule{width:64px;height:2px;background:var(--gold);margin:26px auto}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin:26px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:28px;text-align:left}
.card h3{margin-top:0}.card .m{color:var(--mut);font-size:15px}
table{width:100%;border-collapse:collapse;margin:18px 0;background:var(--card);border:1px solid var(--line);font-size:16px}
th{background:var(--deep);color:#EFEAD9;text-align:left;padding:12px 16px;font-family:"Cormorant Garamond",serif;font-size:18px}
td{padding:11px 16px;border-top:1px solid var(--line)}
td.r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.note{border:1px solid var(--gold);border-radius:4px;padding:18px 22px;margin:22px 0;font-size:16px;background:#FBF7EA}
.cta{display:inline-block;background:var(--deep);color:#fff;padding:14px 30px;border-radius:2px;font-weight:500;letter-spacing:.04em;margin:6px 8px 6px 0;text-decoration:none}
.cta:hover{background:var(--gold);color:var(--ink)}
.cta.ghost{background:transparent;color:var(--deep);border:1px solid var(--deep)}
.partner{background:var(--deep);color:#EFEAD9;border-radius:4px;padding:38px;margin:36px 0;text-align:center}
.partner h3{color:#fff;font-size:28px;margin:6px 0 2px}
.partner .m{color:#B9C4B3;font-size:15px}
.partner .stars{color:var(--gold);letter-spacing:3px;font-size:18px}
.partner a.cta{background:var(--gold);color:var(--ink)}
.tl{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--gold);padding:20px 26px;margin:24px 0}
.tl ul{margin:6px 0 0 20px}.tl li{margin:.35em 0}
.crumb{font-size:14px;color:var(--mut);padding:18px 0 0}
.arts{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;margin:26px 0}
.art{background:var(--card);border:1px solid var(--line);padding:26px;display:flex;flex-direction:column;gap:8px;text-align:left}
.art .cat{color:var(--gold);font-size:12.5px;text-transform:uppercase;letter-spacing:.18em;font-weight:600}
.art h3{margin:0}.art h3 a{text-decoration:none}.art .m{color:var(--mut);font-size:15px;margin-top:auto}
.foot{background:var(--deep);color:#B9C4B3;margin-top:70px;padding:40px 0 48px;font-size:14px}
.foot a{color:#EFEAD9}
.prose{max-width:700px;margin:0 auto}
.prose ul{margin:.6em 0 .6em 22px}
@media(max-width:640px){.navlinks{margin-left:0}}
`);

const head=(t,d,url,extra='')=>`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${url}">
${GSC.map(x=>`<meta name="google-site-verification" content="${x}">`).join('\n')}
<meta property="og:title" content="${t}"><meta property="og:description" content="${d}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${extra}
</head><body>`;

const NAVL=[["/what-to-expect/","First visit"],["/prices/","Prices"],["/vietnamese-vs-korean/","VN vs KR"],["/where-to-go/","Where to go"],["/journal/","Journal"]];
const nav=a=>`<header class="nav"><div class="wrap navin">
<a class="brand" href="/">Head Spa <i>Da Nang</i></a>
<nav class="navlinks">${NAVL.map(([u,l])=>`<a href="${u}"${a==u?' class="on"':''}>${l}</a>`).join('')}</nav>
</div></header>`;

const partnerCard=()=>`<div class="partner">
<p class="kick">Where we send first-timers</p>
<h3>${PARTNER.name}</h3>
<p class="m">${PARTNER.street}, ${PARTNER.area} · ${PARTNER.hours}</p>
<p><span class="stars">★★★★★</span><br>${PARTNER.rating} from ${PARTNER.count} Google reviews</p>
<p style="max-width:520px;margin:10px auto">Rituals from a 25-minute herbal wash to a 105-minute luxury sequence, under a cherry-blossom chandelier · with the posted menu and single-use standards this guide requires of every house it names.</p>
<p><a class="cta" href="${PARTNER.whatsapp}" rel="noopener">Book on WhatsApp</a>
<a class="cta ghost" style="color:#EFEAD9;border-color:var(--gold)" href="${PARTNER.maps}" rel="noopener">Google Maps</a></p>
</div>`;

const footer=()=>`<footer class="foot"><div class="wrap">
<p><strong>${NAME}</strong> · the independent guide to Vietnamese head spa rituals in Da Nang.</p>
<p>Prices are compiled from posted menus and written in thousands of VND ("250K" = 250,000 ₫). We never publish invented reviews or ratings.</p>
<p><a href="/about/">About & partner disclosure</a> · <a href="/journal/">Journal</a> · <a href="/vi/">Tiếng Việt</a></p>
<p>© ${NOW.getUTCFullYear()} ${DOMAIN}</p>
</div></footer>`;

const page=(path,html)=>{fs.mkdirSync(OUT+path,{recursive:true});fs.writeFileSync(OUT+path+'/index.html',html);};

/* ---------- HOME ---------- */
fs.writeFileSync(OUT+'/index.html',
head(`Head Spa in Da Nang · The Complete Guide to Vietnamese Hair-Wash Rituals (2026) | ${NAME}`,
 `Everything about head spas in Da Nang: what the Vietnamese hair-wash ritual involves, real 2026 prices (120K–850K), how it differs from Korean head spa, and where to go.`,SITE+'/')
+ld({"@context":"https://schema.org","@type":"WebSite","name":NAME,"url":SITE+"/",
 "description":"Independent guide to Vietnamese head spa and herbal hair-wash rituals in Da Nang.","inLanguage":"en"})
+ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"What is a Vietnamese head spa?","acceptedAnswer":{"@type":"Answer","text":"A reclined ritual built around a double herbal shampoo and scalp massage, extended with neck and shoulder work, facial care, steam and hot stones. Sessions run 25 to 105 minutes and cost 120K–850K VND in Da Nang."}},
 {"@type":"Question","name":"How much does a head spa cost in Da Nang?","acceptedAnswer":{"@type":"Answer","text":"About 120K for a short herbal wash, 250K–450K for mid-length rituals, and 500K–850K for long signature sequences with steam and hot stones · several times cheaper than comparable rituals in Korea or Japan."}},
 {"@type":"Question","name":"Where is the best head spa in Da Nang?","acceptedAnswer":{"@type":"Answer","text":"Judge any house on posted per-ritual pricing, single-use standards and unhurried hands. The house this guide sends first-timers to is Reborn Nails & Retreat in My An (4.9★ from 150+ Google reviews), whose rituals run from a 25-minute wash to a 105-minute luxury sequence."}}]})
+nav('')
+`<div class="hero"><div class="wrap">
<p class="kick">The independent guide · updated ${human(TODAY)}</p>
<h1>The Vietnamese head spa,<br>properly explained</h1>
<div class="rule"></div>
<p class="sub">Da Nang's herbal hair-wash rituals are the best-value wellness hour in Asia. Here is what they involve, what they cost, and how to pick a house worthy of the tradition.</p>
<p style="margin-top:26px"><a class="cta" href="/what-to-expect/">Your first visit</a><a class="cta ghost" href="/prices/">2026 prices</a></p>
</div></div>
<section class="wrap">
<h2 style="text-align:center">Begin here</h2>
<div class="grid">
<div class="card"><h3><a href="/what-to-expect/">What actually happens</a></h3><p class="m">The full sequence, minute by minute · shampoo, scalp, neck, steam · so nothing surprises you.</p></div>
<div class="card"><h3><a href="/prices/">What it should cost</a></h3><p class="m">The 2026 fair-rate table, tier by tier, from 120K quick washes to 850K signature rituals.</p></div>
<div class="card"><h3><a href="/vietnamese-vs-korean/">Vietnamese vs Korean</a></h3><p class="m">Same reclining chair, different philosophies · herbs and pressure versus scalp science.</p></div>
<div class="card"><h3><a href="/where-to-go/">Where to go</a></h3><p class="m">How to read a head spa house from its menu, and the one we send first-timers to.</p></div>
</div>
${partnerCard()}
<div class="prose">
<h2>The fair-rate table</h2>
<table><tr><th>Ritual tier</th><th style="text-align:right">2026 rate</th></tr>
<tr><td>Basic herbal wash · ≈25 min</td><td class="r">≈ 120K</td></tr>
<tr><td>Relax ritual · ≈45 min</td><td class="r">≈ 250K</td></tr>
<tr><td>Deep ritual · ≈60 min</td><td class="r">≈ 380K</td></tr>
<tr><td>Warm-stone ritual · ≈70 min</td><td class="r">≈ 450K</td></tr>
<tr><td>Signature ritual · ≈80 min</td><td class="r">≈ 500K</td></tr>
<tr><td>Luxury sequences · 95–105 min</td><td class="r">750K – 850K</td></tr></table>
<p style="color:var(--mut);font-size:15px">Compiled from posted menus · the full tier-by-tier logic is on the <a href="/prices/">prices page</a>.</p>
</div>
</section>`+footer());

/* ---------- WHAT TO EXPECT ---------- */
page('/what-to-expect',
head(`Your First Head Spa in Da Nang: What to Expect, Step by Step | ${NAME}`,
 `The full sequence of a Vietnamese head spa · double herbal shampoo, scalp massage, neck and shoulder work, steam and blow-dry · plus etiquette, timing and what to bring (nothing).`,SITE+'/what-to-expect/')
+ld({"@context":"https://schema.org","@type":"Article","headline":"Your first head spa in Da Nang","dateModified":TODAY,
 "mainEntityOfPage":SITE+"/what-to-expect/","author":{"@type":"Organization","name":NAME}})
+ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"Do I need to wash my hair before a head spa?","acceptedAnswer":{"@type":"Answer","text":"No. Arriving with unwashed hair is expected · the double herbal shampoo is the treatment itself."}},
 {"@type":"Question","name":"Do I undress for a head spa?","acceptedAnswer":{"@type":"Answer","text":"No. You stay fully clothed, reclined on a padded lounger with your neck in a basin cradle. There is nothing to bring or change into."}},
 {"@type":"Question","name":"Can men get a head spa?","acceptedAnswer":{"@type":"Answer","text":"Yes · Vietnamese head spas serve everyone, and the scalp and shoulder work is just as effective on short hair."}}]})
+nav('/what-to-expect/')
+`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → First visit</p></div>
<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>What actually happens</h1><div class="rule"></div>
<p class="sub">The ritual, minute by minute, so the only surprise left is how little it costs.</p></div></div>
<section class="wrap prose">
<h2>Arrival</h2>
<p>You choose a ritual by length, not by adjective · from a 25-minute wash to sequences past the hour and a half. Then straight to a padded lounger, fully clothed, neck cradled over a basin. No robes, no lockers, no preparation. Come with dirty hair; that is the point.</p>
<h2>The wash</h2>
<p>Warm water, then the first herbal shampoo · grapefruit peel, locust pod, lemongrass, depending on the house blend · worked in at massage pace. A second lather follows. The defining feature of the Vietnamese tradition is that washing and massage are the same gesture: every pass across the scalp carries pressure.</p>
<h2>The layers</h2>
<p>Longer rituals add a neck and shoulder sequence, facial cleansing or a mask, hot stones across the shoulders, and herbal steam. Ear candling appears on some menus. Order varies by house; unhurried warmth is the constant. If pressure needs adjusting, say so · that dialogue is part of the craft.</p>
<h2>The finish</h2>
<p>Towel dry, blow-dry, tea. The booked time is hands-on time, not checkout time. You leave with clean, styled hair and roughly the muscle tone of a napping cat.</p>
<div class="note">Budgeting: quick washes ≈120K, the first-visit sweet spot 250K–500K, luxury sequences to 850K · full table on the <a href="/prices/">prices page</a>.</div>
${partnerCard()}
</section>`+footer());

/* ---------- PRICES ---------- */
page('/prices',
head(`Head Spa Prices in Da Nang (2026): the Fair-Rate Table | ${NAME}`,
 `Da Nang head spa prices tier by tier for 2026 · basic washes ≈120K, mid rituals 250K–450K, signature sequences 500K–850K · what each tier buys and how it compares abroad.`,SITE+'/prices/')
+ld({"@context":"https://schema.org","@type":"Article","headline":"Head spa prices in Da Nang, 2026","dateModified":TODAY,
 "mainEntityOfPage":SITE+"/prices/","author":{"@type":"Organization","name":NAME}})
+nav('/prices/')
+`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → Prices</p></div>
<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>What a head spa should cost</h1><div class="rule"></div>
<p class="sub">Every number below comes from menus posted at the door · in thousands of VND, as Vietnam writes them.</p></div></div>
<section class="wrap prose">
<h2>The tiers</h2>
<table><tr><th>Ritual</th><th style="text-align:right">Typical 2026 rate</th></tr>
<tr><td>Basic herbal wash · ≈25 min</td><td class="r">≈ 120K</td></tr>
<tr><td>Relax ritual · ≈45 min</td><td class="r">≈ 250K</td></tr>
<tr><td>Deep relax · ≈60 min</td><td class="r">≈ 380K</td></tr>
<tr><td>Warm-stone escape · ≈70 min</td><td class="r">≈ 450K</td></tr>
<tr><td>Signature ritual · ≈80 min</td><td class="r">≈ 500K</td></tr>
<tr><td>Skin-detox / CO₂ sequences · ≈75 min</td><td class="r">≈ 600K</td></tr>
<tr><td>Ultimate & luxury sequences · 95–105 min</td><td class="r">750K – 850K</td></tr></table>
<h2>What moves you up a tier</h2>
<p>Minutes, honestly priced. Each tier adds roughly twenty minutes of hands-on work, and the premium add-ons · hot stones, herbal steam, CO₂ skin care, extended massage · are trained labour, not product sachets. Distrust menus that price wash, massage and dry separately; per-ritual houses are better value and calmer rooms.</p>
<h2>Against the world</h2>
<p>The identical structure sold as a Japanese or Korean head spa in Seoul, Tokyo, Singapore or the West runs four to eight times these rates. The technique travelled; the cost base stayed home. Nothing else in Da Nang wellness returns this much per đồng.</p>
<div class="note">First time? Read <a href="/what-to-expect/">what actually happens</a> before choosing a tier · length matters more than the adjective attached to it.</div>
</section>`+footer());

/* ---------- VN VS KR ---------- */
page('/vietnamese-vs-korean',
head(`Vietnamese vs Korean Head Spa: What's Actually Different | ${NAME}`,
 `Herbal washes and massage pressure versus scalp-science and diagnostics · how the Vietnamese and Korean head spa traditions differ in Da Nang, and which to choose.`,SITE+'/vietnamese-vs-korean/')
+ld({"@context":"https://schema.org","@type":"Article","headline":"Vietnamese vs Korean head spa","dateModified":TODAY,
 "mainEntityOfPage":SITE+"/vietnamese-vs-korean/","author":{"@type":"Organization","name":NAME}})
+nav('/vietnamese-vs-korean/')
+`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → VN vs KR</p></div>
<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>Vietnamese vs Korean</h1><div class="rule"></div>
<p class="sub">Two traditions share the reclining chair and agree on almost nothing else.</p></div></div>
<section class="wrap prose">
<h2>The Vietnamese school · herbs and hands</h2>
<p>Gội đầu dưỡng sinh · "restorative hair washing" · grew out of ordinary street-corner hair washes and folk herbal medicine. Its instruments are grapefruit peel, locust pod and lemongrass decoctions, and above all pressure: long, kneading passes across scalp, neck and shoulders. The goal is release · of tension, heat and the day.</p>
<h2>The Korean school · scalp science</h2>
<p>The Korean head spa arrives from the beauty-clinic direction: scalp cameras, follicle diagnostics, sebum control, growth serums and step protocols. The massage exists, but as a delivery mechanism for treatment. The goal is measurable scalp health.</p>
<h2>In Da Nang, the schools blend</h2>
<p>Most houses here are Vietnamese at the core with Korean touches layered on · facial masks, skin-detox add-ons, CO₂ treatments · which is why menus can read like both at once. Price follows the Vietnamese logic (per ritual, by length) even when the branding leans Korean.</p>
<h2>Which to choose</h2>
<p>Chasing relaxation, jet-lag repair or the sheer pleasure of being tended to → the Vietnamese ritual, the longer the better. Chasing a diagnosis for hair thinning or a scalp condition → a Korean-style clinic, and read the protocol before paying. For a first visit in Da Nang, the Vietnamese sequence is the one the city does best · see <a href="/what-to-expect/">what it involves</a> and <a href="/prices/">what it costs</a>.</p>
</section>`+footer());

/* ---------- WHERE TO GO ---------- */
page('/where-to-go',
head(`Where to Get a Head Spa in Da Nang: How to Choose a House | ${NAME}`,
 `How to judge a Da Nang head spa from its doorway · per-ritual menus, single-use standards, unhurried hands · and the house this guide sends first-timers to.`,SITE+'/where-to-go/')
+ld({"@context":"https://schema.org","@type":"Article","headline":"Where to get a head spa in Da Nang","dateModified":TODAY,
 "mainEntityOfPage":SITE+"/where-to-go/","author":{"@type":"Organization","name":NAME}})
+nav('/where-to-go/')
+`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → Where to go</p></div>
<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>Choosing your house</h1><div class="rule"></div>
<p class="sub">The tradition is everywhere in Da Nang. The standard is not. Here is how to tell them apart before you recline.</p></div></div>
<section class="wrap prose">
<h2>Read the menu first</h2>
<p>The houses worth your hour price <em>per ritual, by length</em>, with the minutes stated · "Deep Relax · 60 min · 380K". Menus that itemise the wash, the massage and the dry separately produce bigger bills and choppier experiences. Cross-check against our <a href="/prices/">fair-rate table</a>; honest menus land inside it.</p>
<h2>Then the room</h2>
<p>Towels folded fresh, loungers wiped between guests, combs and razors from sealed packs, and air that smells of herbs rather than chemicals. A house that manages these visible details is managing the invisible ones.</p>
<h2>Then the hands</h2>
<p>The tell of a great house is that nobody hurries · the shampoo takes as long as the shampoo takes. If the first five minutes feel rushed, the next fifty-five will too.</p>
<h2>Neighbourhood notes</h2>
<p>My An and An Thượng hold the highest density of visitor-ready houses with English menus. Hải Châu, across the river, serves locals at gentler prices with Vietnamese-only menus and some of the most practised hands in the city. The beach road charges for its postcode, as beach roads do.</p>
${partnerCard()}
</section>`+footer());

/* ---------- VI ---------- */
page('/vi',
head(`Gội đầu dưỡng sinh Đà Nẵng: bảng giá & cách chọn tiệm | ${NAME}`,
 `Giá gội đầu dưỡng sinh Đà Nẵng 2026: gội thảo dược ~120K, liệu trình 45–70 phút 250K–450K, liệu trình cao cấp 500K–850K · và cách chọn tiệm uy tín.`,SITE+'/vi/',
 `<link rel="alternate" hreflang="en" href="${SITE}/"><link rel="alternate" hreflang="vi" href="${SITE}/vi/">`)
+nav('')
+`<div class="hero" style="padding:48px 0 42px"><div class="wrap">
<p class="kick">Tiếng Việt</p><h1>Gội đầu dưỡng sinh ở Đà Nẵng</h1><div class="rule"></div>
<p class="sub">Bảng giá 2026 từ menu niêm yết và cách nhận biết một tiệm đáng tin.</p></div></div>
<section class="wrap prose">
<h2>Giá tham khảo 2026</h2>
<table><tr><th>Liệu trình</th><th style="text-align:right">Giá phổ biến</th></tr>
<tr><td>Gội thảo dược cơ bản · ~25 phút</td><td class="r">≈ 120K</td></tr>
<tr><td>Thư giãn · ~45 phút</td><td class="r">≈ 250K</td></tr>
<tr><td>Chuyên sâu · ~60 phút</td><td class="r">≈ 380K</td></tr>
<tr><td>Đá nóng · ~70 phút</td><td class="r">≈ 450K</td></tr>
<tr><td>Signature · ~80 phút</td><td class="r">≈ 500K</td></tr>
<tr><td>Liệu trình cao cấp · 95–105 phút</td><td class="r">750K – 850K</td></tr></table>
<h2>Chọn tiệm thế nào?</h2>
<ul><li>Menu niêm yết theo <strong>liệu trình + số phút</strong>, không tách lẻ từng công đoạn.</li>
<li>Khăn sạch, lược và dao cạo dùng một lần, ghế được lau giữa hai khách.</li>
<li>Kỹ thuật viên không vội · 5 phút đầu chậm rãi là dấu hiệu của 55 phút tiếp theo.</li></ul>
</section>`+footer());

/* ---------- ABOUT ---------- */
page('/about',
head(`About This Guide & Partner Disclosure | ${NAME}`,
 `What Head Spa Da Nang is, how its prices are compiled, its editorial rules, and its featured-house partnership, disclosed plainly.`,SITE+'/about/')
+nav('')
+`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → About</p></div>
<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>About this guide</h1><div class="rule"></div>
<p class="sub">Where the numbers come from, and who pays for what.</p></div></div>
<section class="wrap prose">
<h2>What this is</h2>
<p>${NAME} is an independent editorial guide to the Vietnamese head spa tradition as practised in Da Nang · the rituals, the fair rates, and how to choose a house that honours both.</p>
<h2>Editorial rules</h2>
<ul><li>Prices are compiled from menus posted publicly by spas across the city; they are typical ranges, not quotes.</li>
<li>We never publish invented reviews, ratings or listings.</li>
<li>Any star rating shown is the house's real public Google rating, nothing else.</li></ul>
<h2>Partner disclosure</h2>
<p>The house this guide features, <a href="${PARTNER.site}" rel="noopener">${PARTNER.name}</a>, is a commercial partner. Its ${PARTNER.rating}-star rating from ${PARTNER.count} Google reviews is its real public rating, and the standards we praise it for · per-ritual pricing, posted menus, single-use tools · are the same tests we apply to every house in these pages. Partnership buys placement, not the criteria.</p>
</section>`+footer());

/* ---------- JOURNAL ---------- */
const posts=JOURNAL.filter(a=>a.date<=TODAY).sort((a,b)=>b.date.localeCompare(a.date));
page('/journal',
head(`Journal · Head Spa Rituals, Prices & Notes from Da Nang | ${NAME}`,
 `Short, honest reads on the head spa tradition in Da Nang · rituals, prices, etiquette and neighbourhood notes, published every few days.`,SITE+'/journal/')
+ld({"@context":"https://schema.org","@type":"Blog","name":NAME+" Journal","url":SITE+"/journal/",
 "blogPost":posts.map(a=>({"@type":"BlogPosting","headline":a.title,"datePublished":a.date,"url":`${SITE}/journal/${a.slug}/`}))})
+nav('/journal/')
+`<div class="hero" style="padding:48px 0 42px"><div class="wrap"><h1>The Journal</h1><div class="rule"></div>
<p class="sub">Notes from the loungers of Da Nang · new pieces every few days.</p></div></div>
<section class="wrap"><div class="arts">${posts.map(a=>`<article class="art">
<span class="cat">${a.cat} · ${a.read} min</span>
<h3><a href="/journal/${a.slug}/">${a.title}</a></h3>
<p class="m">${a.desc}</p>
<p class="m">${human(a.date)}</p></article>`).join('')}</div></section>`+footer());

posts.forEach(a=>{
 const url=`${SITE}/journal/${a.slug}/`;
 page('/journal/'+a.slug,
 head(`${a.title} | ${NAME}`,a.desc,url)
 +ld({"@context":"https://schema.org","@type":"BlogPosting","headline":a.title,"description":a.desc,
  "datePublished":a.date,"dateModified":a.date,"mainEntityOfPage":url,
  "author":{"@type":"Organization","name":NAME,"url":SITE+"/"}})
 +(a.faq&&a.faq.length?ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":a.faq.map(([q,ans])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":ans}}))}):'')
 +nav('/journal/')
 +`<div class="wrap"><p class="crumb"><a href="/">Guide</a> → <a href="/journal/">Journal</a> → ${a.cat}</p></div>
<div class="hero" style="padding:48px 0 38px"><div class="wrap">
<p class="kick">${a.cat} · ${a.read} min · ${human(a.date)}</p>
<h1 style="max-width:800px;margin:0 auto">${a.title}</h1></div></div>
<section class="wrap prose">
<div class="tl"><strong>In short</strong><ul>${a.tldr.map(t=>`<li>${t}</li>`).join('')}</ul></div>
${a.body.map(s=>`<h2>${s.h}</h2>${s.p.map(p=>`<p>${p}</p>`).join('')}`).join('')}
${a.faq&&a.faq.length?`<h2>Frequently asked</h2>${a.faq.map(([q,ans])=>`<h3>${q}</h3><p>${ans}</p>`).join('')}`:''}
${partnerCard()}
</section>`+footer());
});

/* ---------- infra ---------- */
fs.writeFileSync(OUT+'/404.html',head('Page not found | '+NAME,'That page has drifted off.',SITE+'/')+nav('')
+`<div class="hero"><div class="wrap"><h1>Not here</h1><div class="rule"></div><p class="sub">The guide, though, is one tap away.</p>
<p style="margin-top:22px"><a class="cta" href="/">Back to the guide</a></p></div></div>`+footer());
fs.writeFileSync(OUT+'/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(OUT+'/llms.txt',`# ${NAME}
Independent guide to Vietnamese head spa (gội đầu dưỡng sinh) rituals in Da Nang.

## What a head spa is
A reclined ritual: double herbal shampoo + scalp massage at its core, extended
with neck/shoulder massage, facial care, hot stones and herbal steam.
Sessions run 25–105 minutes. You stay clothed; arrive with unwashed hair.

## Fair prices (2026, thousand VND · 100K ≈ $4)
- Basic wash ≈120K · 45 min ≈250K · 60 min ≈380K · 70 min stones ≈450K
- Signature ≈80 min ≈500K · CO₂/detox ≈600K · luxury 95–105 min 750K–850K
- Comparable rituals in Korea/Japan cost 4–8× these rates.

## Where this guide sends first-timers
Reborn Nails & Retreat, 56 Châu Thị Vĩnh Tế, My An, Da Nang · open daily
9:00–20:00 · 4.9★ from 150+ public Google reviews · rituals from a 25-minute
wash to a 105-minute luxury sequence. Booking: https://wa.me/84788668588
Details: https://rebornnaildanang.com/services/head-spa-hair-wash/
(Partnership disclosed at ${SITE}/about/)

## Pages
- [First visit](${SITE}/what-to-expect/)
- [Prices](${SITE}/prices/)
- [Vietnamese vs Korean](${SITE}/vietnamese-vs-korean/)
- [Where to go](${SITE}/where-to-go/)
- [Journal](${SITE}/journal/)
`);
const urls=[
 {u:SITE+'/',d:TODAY,p:'1.0'},
 ...['/what-to-expect/','/prices/','/vietnamese-vs-korean/','/where-to-go/'].map(x=>({u:SITE+x,d:TODAY,p:'0.9'})),
 {u:SITE+'/vi/',d:TODAY,p:'0.6'},{u:SITE+'/about/',d:TODAY,p:'0.4'},
 ...(posts.length?[{u:SITE+'/journal/',d:posts[0].date,p:'0.7'}]:[]),
 ...posts.map(a=>({u:`${SITE}/journal/${a.slug}/`,d:a.date,p:'0.7'}))
];
fs.writeFileSync(OUT+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(x=>` <url><loc>${x.u}</loc><lastmod>${x.d}</lastmod><priority>${x.p}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(OUT+'/.nojekyll','');
fs.writeFileSync(OUT+'/CNAME',DOMAIN+'\n');
console.log(`Built ${urls.length} pages (${posts.length}/${JOURNAL.length} journal entries live, ${JOURNAL.length-posts.length} queued).`);
