/* "Steam" — the visual language of a herbal bath house.
   Deep petrol green, jade and amber, a high-contrast serif over a neutral grotesque.
   Distinct from the sister nail guide on every axis: palette, type, rhythm. */
module.exports=`
:root{
 --ink:#0C231F; --ink-2:#123830; --paper:#F6F5F0; --line:#DFDCD2;
 --lacquer:#1E7A5F; --lacquer-d:#146049; --chrome:#9FBDAF; --gold:#C08A2E;
 --mut:#5C6660; --mut-l:#9AA39D;
 --r:14px; --sp:clamp(18px,4vw,26px);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
body{background:var(--paper);color:var(--ink);font:17px/1.62 "Inter Tight",-apple-system,system-ui,sans-serif;
 -webkit-font-smoothing:antialiased}
h1,h2,h3,h4,.brand,.stat b,.sr-n{font-family:"Newsreader",Georgia,serif;font-weight:700;line-height:1.05;letter-spacing:-.012em}
h1{font-size:clamp(36px,6.2vw,66px)}
h2{font-size:clamp(24px,3.2vw,36px);margin:2em 0 .5em}
h3{font-size:21px;margin:1.5em 0 .35em;letter-spacing:-.01em}
h4{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
p{margin:.75em 0}
a{color:var(--lacquer-d);text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:3px}
.wrap{max-width:1120px;margin:0 auto;padding:0 var(--sp)}
.m,.fine{color:var(--mut);font-size:14.5px}
.skip{position:absolute;left:-9999px}
.skip:focus{left:12px;top:12px;z-index:99;background:var(--ink);color:#fff;padding:10px 16px;border-radius:8px}
:focus-visible{outline:2.5px solid var(--lacquer);outline-offset:3px;border-radius:4px}

/* ---- nav ---- */
.nav{background:var(--ink);color:#EDF2EF;position:sticky;top:0;z-index:20;
 box-shadow:0 1px 0 rgba(255,255,255,.07)}
.navin{display:flex;align-items:center;gap:22px;padding:13px 0;flex-wrap:wrap}
.brand{color:#fff;font-size:20px;letter-spacing:-.03em;display:flex;align-items:center;gap:9px}
.brand:hover{text-decoration:none}
.brand:before{content:"";width:20px;height:20px;border-radius:50% 50% 50% 4px;flex:none;transform:rotate(-45deg);
 background:linear-gradient(140deg,#6FD3AC 6%,var(--lacquer) 48%,var(--lacquer-d) 100%);
 box-shadow:inset 2px 2px 0 rgba(255,255,255,.4)}
.nlinks{display:flex;gap:19px;flex-wrap:wrap;font-size:14.5px;margin-left:auto}
.nlinks a{color:#CADAD1}
.nlinks a:hover,.nlinks a[aria-current]{color:#fff;text-decoration:none}
.nlinks a[aria-current]{box-shadow:0 2px 0 var(--lacquer)}
.lang{position:relative;font-size:14px}
.lang summary{list-style:none;cursor:pointer;color:#CADAD1;padding:4px 10px;border:1px solid #265046;border-radius:99px}
.lang summary::-webkit-details-marker{display:none}
.lang summary:after{content:" ▾"}
.lang div{position:absolute;right:0;top:132%;background:#fff;border:1px solid var(--line);border-radius:12px;
 padding:7px;min-width:150px;box-shadow:0 18px 40px rgba(12,35,31,.2);z-index:30}
.lang div a{display:block;padding:8px 12px;border-radius:8px;color:var(--ink);font-size:14.5px}
.lang div a:hover{background:#EDF3EF;text-decoration:none}

/* ---- hero ---- */
.hero{background:var(--ink);color:#F0F5F2;padding:clamp(52px,8vw,86px) 0 clamp(46px,7vw,72px);position:relative;overflow:hidden}
.hero:after{content:"";position:absolute;inset:0;pointer-events:none;
 background:radial-gradient(58% 78% at 88% 4%,rgba(30,122,95,.34),transparent 62%),
            radial-gradient(46% 62% at 4% 96%,rgba(192,138,46,.18),transparent 66%)}
.hero .wrap{position:relative;z-index:1}
.hero h1{color:#fff;max-width:16ch}
.hero .lede{color:#B6C9BF;font-size:clamp(17px,2vw,20px);max-width:56ch;margin-top:18px}
.eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;letter-spacing:.15em;
 text-transform:uppercase;color:var(--lacquer);margin-bottom:15px}
.hero .eyebrow{color:#6FD3AC}
/* signature: the swatch strip */
.swatch{display:flex;flex-direction:column;gap:9px;margin:28px 0 0;max-width:340px}
.swatch i{height:2px;display:block;border-radius:2px;opacity:.85}
.swatch i:nth-child(1){width:100%}.swatch i:nth-child(2){width:78%}.swatch i:nth-child(3){width:92%}
.swatch i:nth-child(4){width:64%}.swatch i:nth-child(5){width:84%}.swatch i:nth-child(6){width:48%}
.acts{display:flex;flex-wrap:wrap;gap:11px;margin-top:26px}
.btn{display:inline-block;background:var(--lacquer);color:#fff;padding:13px 25px;border-radius:99px;
 font-weight:600;font-size:15.5px;border:1.5px solid var(--lacquer)}
.btn:hover{background:var(--lacquer-d);border-color:var(--lacquer-d);text-decoration:none;color:#fff}
.btn.ghost{background:transparent;color:var(--lacquer);}
.hero .btn.ghost{color:#fff;border-color:rgba(255,255,255,.45)}
.hero .btn.ghost:hover{background:rgba(255,255,255,.12)}

/* ---- page header (inner pages) ---- */
.ph{padding:clamp(34px,5vw,54px) 0 8px;max-width:58ch}
.ph .lede{color:var(--mut);font-size:19px;margin-top:14px}
.crumb{font-size:13.5px;color:var(--mut);padding:16px 0 0;font-family:"JetBrains Mono",monospace}
.crumb a{color:var(--mut)}.crumb span{color:var(--ink)}

/* ---- stats ---- */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:12px;margin:30px 0}
.stats div{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:19px 20px}
.stats b{display:block;font-size:31px;color:var(--lacquer-d);line-height:1;letter-spacing:-.03em}
.stats span{color:var(--mut);font-size:13.5px;display:block;margin-top:5px}

/* ---- chips ---- */
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 28px}
.chip{border:1px solid var(--line);background:#fff;border-radius:99px;padding:8px 15px;font-size:14.5px;
 color:var(--ink);display:inline-flex;align-items:center;gap:8px}
.chip b{color:var(--mut);font-weight:500;font-size:12.5px}
.chip:hover,.chip.on{border-color:var(--lacquer);color:var(--lacquer-d);text-decoration:none}
.chip.on{background:#EDF5F1}

/* ---- ranked list (the swatch strip, applied) ---- */
.srl{list-style:none;border:1px solid var(--line);border-radius:var(--r);background:#fff;overflow:hidden;margin:22px 0 10px}
.sr{display:grid;grid-template-columns:52px 1fr auto auto;gap:14px;align-items:center;
 padding:15px 18px;border-top:1px solid var(--line)}
.sr:first-child{border-top:0}
.sr:hover{background:#F8FAF8}
.sr-n{font-size:15px;color:var(--mut-l);text-align:center;font-variant-numeric:tabular-nums}
.sr.is-pick{background:linear-gradient(90deg,#EDF6F2,#fff 62%)}
.sr.is-pick .sr-n{color:var(--lacquer);position:relative}
.sr.is-pick .sr-n:after{content:"";position:absolute;left:-18px;top:-15px;bottom:-15px;width:4px;background:var(--lacquer)}
.sr-t{font-weight:600;color:var(--ink);font-size:16.5px}
.sr-a{display:block;color:var(--mut);font-size:13.5px;margin-top:3px}
.sr-r{text-align:right;white-space:nowrap}
.sr-r b{color:var(--lacquer-d);font-size:17px}
.rc{color:var(--mut);font-size:13px;margin-left:5px}
.sr-r .rc:before{content:"("}.sr-r .rc:after{content:")"}
.sr-l{font-size:13.5px;white-space:nowrap;color:var(--mut)}
.badge{background:var(--lacquer);color:#fff;font-size:10px;letter-spacing:.08em;text-transform:uppercase;
 padding:3px 8px;border-radius:99px;margin-left:8px;font-weight:700;white-space:nowrap}
.src{color:var(--mut);font-size:13.5px;margin:0 0 30px}

/* ---- editorial pick ---- */
.pick{background:var(--ink);color:#EDF2EF;border-radius:20px;margin:34px 0;overflow:hidden;
 display:grid;grid-template-columns:1.25fr .85fr;position:relative}
.pick:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;
 background:linear-gradient(180deg,var(--lacquer),var(--chrome))}
.pick.compact{grid-template-columns:1fr}
.pick-b{padding:clamp(26px,3.4vw,38px)}
.pick h3{margin:0 0 6px;font-size:clamp(24px,2.6vw,31px)}
.pick h3 a{color:#fff}
.pick-m{color:#9CB1A6;font-size:14.5px;margin:0 0 12px}
.pick-t{color:#CADAD1;max-width:52ch;font-size:15.5px}
.pick .rating b{color:#fff;font-size:19px}
.pick .st{color:var(--gold);letter-spacing:1px}
.pick .rc{color:#9CB1A6}
.pick-p{margin:0}
.pick-p img{width:100%;height:100%;object-fit:cover;display:block;min-height:230px}
.pick .btn.ghost{color:#fff;border-color:rgba(255,255,255,.42)}
.pick .btn.ghost:hover{background:rgba(255,255,255,.12)}

/* ---- business page ---- */
.biz{padding-bottom:20px}
.biz-h{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(22px,3vw,40px);align-items:start;padding:26px 0 8px}
.biz-h h1{font-size:clamp(30px,4.6vw,50px);margin-bottom:12px}
.biz-a{color:var(--mut);font-size:16px}
.rating b{font-size:22px;color:var(--lacquer-d)}
.rating .st{color:var(--gold);letter-spacing:1.5px;margin:0 6px}
.rating.big b{font-size:30px}
.biz-map{border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:#E7EBE6;min-height:270px}
.biz-map iframe{width:100%;height:100%;min-height:270px;border:0;display:block}
.biz-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px;margin:30px 0}
.biz-c{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:24px}
.biz-c h2{margin:0 0 10px;font-size:19px}
.hrs{list-style:none;font-size:15px;font-variant-numeric:tabular-nums}
.hrs li{padding:5px 0;border-top:1px solid var(--line);color:var(--mut)}
.hrs li:first-child{border-top:0}

/* ---- service pages ---- */
.cols{display:grid;grid-template-columns:1.55fr .9fr;gap:clamp(24px,3.4vw,46px);align-items:start;margin-top:26px}
.prose{max-width:66ch}
.prose h2{margin-top:1.5em}
.prose ul{margin:.7em 0 .7em 22px}
.prose li{margin:.3em 0}
.side{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:24px;position:sticky;top:74px}
.side h3{margin-top:0}
.pt{width:100%;border-collapse:collapse;font-size:15px}
.pt td{padding:9px 0;border-top:1px solid var(--line)}
.pt tr:first-child td{border-top:0}
.pt td.r{text-align:right;font-weight:650;color:var(--lacquer-d);white-space:nowrap;font-variant-numeric:tabular-nums}
figure.wide{margin:26px 0;border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}
figure.wide img{width:100%;height:clamp(220px,32vw,380px);object-fit:cover;display:block}

/* ---- cards / faq / tables ---- */
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(252px,1fr));gap:16px;margin:26px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:24px}
.card h3{margin-top:0}
.card:hover{border-color:var(--chrome)}
.faq details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin:9px 0}
.faq summary{cursor:pointer;font-weight:600;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary:before{content:"+";color:var(--lacquer);font-weight:700;margin-right:10px}
.faq details[open] summary:before{content:"−"}
.faq p{color:var(--mut);margin:10px 0 0}
table.data{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);
 border-radius:var(--r);overflow:hidden;margin:20px 0;font-size:15.5px}
table.data th{background:var(--ink);color:#EDF2EF;text-align:left;padding:12px 16px;font-family:"Newsreader",serif;font-weight:600}
table.data td{padding:11px 16px;border-top:1px solid var(--line)}
table.data td.r{text-align:right;font-weight:650;color:var(--lacquer-d);white-space:nowrap;font-variant-numeric:tabular-nums}
.note{background:#EDF5F1;border-left:3px solid var(--lacquer);border-radius:0 12px 12px 0;padding:17px 21px;margin:22px 0;font-size:15.5px}
.tl{background:#fff;border:1px solid var(--line);border-left:3px solid var(--lacquer);border-radius:0 12px 12px 0;padding:20px 24px;margin:24px 0}
.tl ul{margin:8px 0 0 20px}.tl li{margin:.35em 0}
.arts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin:26px 0}
.art{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:24px;display:flex;flex-direction:column;gap:9px}
.art h3{margin:0;font-size:20px}
.art .cat{font-family:"JetBrains Mono",monospace;font-size:11.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--lacquer)}
.art .m{margin-top:auto}

/* ---- footer ---- */
.foot{background:var(--ink);color:#9CB1A6;margin-top:76px;padding:48px 0 44px;font-size:14.5px}
.foot a{color:#CADAD1}
.kwf{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:26px;
 padding-bottom:32px;border-bottom:1px solid #1B3C33}
.kwf h4{color:#7C9188;margin-bottom:11px}
.kwf ul{list-style:none;font-size:14px}
.kwf li{margin:.36em 0}
.foot-b{padding-top:26px}
.foot .fine{color:#7C9188;font-size:13px;max-width:82ch}
.credit{color:#6A7D74;font-size:12.5px;margin-top:12px;max-width:82ch}
.credit a{color:#7C9188}

@media(max-width:860px){
 .pick,.biz-h,.cols{grid-template-columns:1fr}
 .side{position:static}
 .pick-p img{min-height:190px}
}
@media(max-width:620px){
 .sr{grid-template-columns:34px 1fr auto;gap:10px;padding:13px 14px}
 .sr-l{display:none}
 .nlinks{gap:14px;font-size:13.5px;order:3;margin-left:0;width:100%;padding-top:4px}
 .lang{margin-left:auto}
}

/* ---- editorial note (replaces the old banner block) ---- */
.ed{margin:44px 0;border-top:2px solid var(--ink);padding-top:0}
.ed-t{display:flex;align-items:center;gap:14px;padding:12px 0 20px}
.ed-l{font-family:"JetBrains Mono",monospace;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);white-space:nowrap}
.ed-r{flex:1;height:1px;background:var(--line)}
.ed-g{display:grid;grid-template-columns:1.35fr .95fr;gap:clamp(22px,3.2vw,42px);align-items:start}
.ed-b h3{margin:0 0 4px;font-size:clamp(23px,2.5vw,30px)}
.ed-b h3 a{color:var(--ink)}
.ed-b h3 a:hover{color:var(--lacquer-d);text-decoration:none}
.ed-m{color:var(--mut);font-size:14.5px;margin:0 0 10px}
.ed-b p{max-width:56ch}
.ed-a{margin-top:16px;font-weight:600}
.ed-p{margin:0;border-radius:4px;overflow:hidden;border:1px solid var(--line)}
.ed-p img{width:100%;height:100%;min-height:230px;object-fit:cover;display:block}
.ed-p figcaption{font-size:11.5px;color:var(--mut);padding:7px 10px;background:#fff}
.ednote{border-left:3px solid var(--lacquer);background:#fff;padding:16px 22px;margin:30px 0;font-size:15.5px}
.ednote-l{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);margin:0 0 5px}
.ednote p{margin:0}

/* ---- Google photos & reviews ---- */
.gp{margin:0;border-radius:4px;overflow:hidden;border:1px solid var(--line);background:#fff}
.gp img{width:100%;height:100%;object-fit:cover;display:block}
.gp figcaption{font-size:11.5px;color:var(--mut);padding:7px 11px}
.gp.lead{margin-bottom:12px}
.gp.lead img{height:clamp(180px,26vw,240px)}
.gal{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin:20px 0 8px}
.gal .gp img{height:200px}
.revs{display:grid;grid-template-columns:repeat(auto-fit,minmax(272px,1fr));gap:16px;margin:20px 0}
.rev{background:#fff;border:1px solid var(--line);border-radius:4px;padding:22px;margin:0;font-size:15.5px}
.rev p{margin:0}
.rev-s{color:var(--gold);letter-spacing:2px;margin-bottom:9px!important;font-size:14px}
.rev footer{margin-top:13px;color:var(--mut);font-size:13px;font-style:normal}

/* precise star bar */
.sb{position:relative;display:inline-block;white-space:nowrap;line-height:1;vertical-align:-1px}
.sb-b{color:#D8D2DC;letter-spacing:1.5px}
.sb-f{position:absolute;left:0;top:0;overflow:hidden;color:var(--gold);letter-spacing:1.5px}
.rating .sb{font-size:16px}
.rating.big .sb{font-size:20px}
.rev-s .sb{font-size:15px}


.sr-r{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.sr-r b{line-height:1.1}
.sr-r .sb{font-size:12px;letter-spacing:0}
.sr-r .rc{margin:0;font-size:12px}


/* ---- reader reviews & submission form ---- */
.rev.is-reader{border-left:3px solid var(--lacquer)}
.rvf-w{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:26px;margin:24px 0}
.rvf-w h3{margin:0 0 4px}
.rvf{display:flex;flex-direction:column;gap:14px;margin-top:16px;max-width:620px}
.rvf label{display:flex;flex-direction:column;gap:6px;font-size:14.5px;font-weight:600;color:var(--ink)}
.rvf-r{display:grid;grid-template-columns:150px 1fr;gap:14px}
.rvf input,.rvf select,.rvf textarea{font:inherit;font-weight:400;padding:11px 13px;border:1px solid var(--line);
 border-radius:9px;background:var(--paper);color:var(--ink);width:100%}
.rvf textarea{resize:vertical;line-height:1.5}
.rvf input:focus,.rvf select:focus,.rvf textarea:focus{outline:2px solid var(--lacquer);outline-offset:1px;border-color:transparent}
.rvf button{align-self:flex-start;cursor:pointer;font:inherit}
.rvf .m{font-weight:400}
@media(max-width:560px){.rvf-r{grid-template-columns:1fr}}

`;
