/* Build check (27/11/2026, after Lucas found the "Da Nang" group page posing
   as the city ranking, led by a 40/100). Runs at the end of every build over
   every page written to docs/, and throws, so a faulty build never ships.

   1. A page that claims the best venue of the city (title, H1, question, meta
      or ItemList, in any of the site's languages) must carry the city ranking:
      its ItemList starts with the city's first venue on the score, and the
      score it quotes for its first venue is at least 60/100.
   2. Every ranked list (ItemList of venues) follows the score order.
   3. An area page names its area; a street page names its street.
   4. No "X, X" repetition in a title, H1, question or meta description.
   Returns the list of problems; build.js throws if it is not empty. */
const fs=require('fs'),path=require('path');

const CITY=[
  /\bbest\b[^|]*\bin Da Nang\b(?!,)/i, /\btop \d+ [^|]*\bin Da Nang\b(?!,)/i,
  /meilleur[es]*[^|]*\sà Da Nang/i,
  /(tốt nhất|đẹp nhất)[^|]*Đà Nẵng/i,
  /다낭[^|]*(추천|최고|베스트)/, /岘港[^|]*(推荐|最好|最佳)/, /峴港[^|]*(推薦|最好|最佳)/, /ダナン[^|]*(おすすめ|一番|ベスト)/,
  /лучш[^|]*Дананг/i, /\bbeste[n]?\b[^|]*\bin Da Nang\b/i, /\bmejor(es)?\b[^|]*\b(en|de) Da Nang\b/i, /ดีที่สุด[^|]*ดานัง|ดานัง[^|]*(ดีที่สุด|แนะนำ)/,
  /* 5 langues ajoutées le 27/11 (motifs fournis avec les traductions) */ new RegExp("\\bmigliori?\\b[^|]*\\ba Da Nang\\b","iu"), new RegExp("\\bbeste\\b[^|]*\\bin Da Nang\\b","iu"), new RegExp("峴港[^|]*(推薦|最好|最佳)","iu"), new RegExp("दा नांग[^|]*(सबसे अच्छ|सर्वश्रेष्ठ)|(सबसे अच्छ|सर्वश्रेष्ठ)[^|]*दा नांग","iu"), new RegExp("\\bterbaik\\b[^|]*\\bdi Da Nang\\b","iu"),
];
const REPEAT=/(?:^|[,(·|:] |\bin |\bof |— )([\p{L}][\p{L} .'’-]{2,30}), \1(?=\s*(?:[,.;:()|·?!—]|$))/u;

/* 6. language pages: the right script in title and H1, no English interface text left behind */
const SCRIPT={'zh-tw':/[\u4e00-\u9fff]/,zh:/[\u4e00-\u9fff]/,ja:/[\u3040-\u30ff\u4e00-\u9fff]/,ko:/[\uac00-\ud7af]/,ru:/[\u0400-\u04ff]/,th:/[\u0e00-\u0e7f]/,hi:/[\u0900-\u097f]/};
const LATIN={it:/\b(il|la|le|di|dei|delle|degli|quanto|costa|tutti|migliori|centri|zone)\b/i,nl:/\b(de|het|een|van|wat|kost|alle|beste|beoordeelde|wijken)\b/i,ms:/\b(di|yang|dan|semua|berapakah|terbaik|salun|kawasan|kos)\b/i,fr:/\b(le|la|les|des|de|du|combien|meilleurs?|tous|quartiers?)\b|à /i,de:/\b(die|der|das|alle|wie|viel|beste[n]?|kostet|bewertete[n]?)\b/i,es:/\b(el|la|los|las|de|cuánto|mejores?|todos)\b/i,vi:/(ở|của|các|và|gần|làm|tốt nhất|giá|tiệm|cơ sở|bao nhiêu|tất cả)/i};
const EN_UI=/(Google reviews|Why it is (first|here)|Hours, map and reviews|Frequently asked|Opening hours|Every rated|How much does|What reviewers say|Sorted by Google|Top 5 on our 100-point score|Our own count|Looking for the best|highest score of the|By the same score applied|Avec le même score appliqué|With the same score|This guide's pick is|Why .{2,40} is first)/;

/* 7. (27/11, lead) no sentence starting with a small letter after a full stop, in the text we write
      (answer, prose, why list, pick table, FAQ); quoted reviews are not checked */
const ABBR=/^(e\.g|i\.e|etc|vs|approx|ca|env|min|max|km|no|nr|st|p\.m|a\.m|incl|inkl|bzw|z\.b|ggf|ecc|cf|dll|dsb|tel|av|mr|mrs|dr|г|гг|ул|тыс|руб|д|см|ср|т\.е|т\.к|т\.д|т\.п)$/iu;
const ownText=b=>[...b.matchAll(/<div class="(?:ans|prose|why|pick-t|faq)"[^>]*>([\s\S]*?)<\/div>/g)].map(m=>m[1].replace(/<blockquote[\s\S]*?<\/blockquote>/g,' ').replace(/<q\b[\s\S]*?<\/q>/g,' ')).join(' ');
/* 8. (27/11, lead) a page never announces a "top three" other than its own ranking */
const TOP3=/\b(?:the )?top three (?:are|is)\b|\bthe first three (?:are|is)\b|\btrois premi[eè]r(?:e)?s (?:sont|:)|\blos tres primeros son\b|\bdie ersten drei\b|\bi primi tre sono\b|\bde eerste drie zijn\b|ba vị trí cao nhất là|상위 3곳|前三名为|前三名為|上位3軒|первая тройка|สามอันดับแรกคือ|पहले तीन हैं|tiga teratas ialah/iu;
/* 9. (27/11, lead) nothing on the pick's steriliser until Lucas gives the model: the pick's own blocks */
const STERI=/sterili[sz]|stérilis|esteriliz|sterilizz|steriliseer|sterilisi|消毒|살균|滅菌|стерил|khử trùng|ฆ่าเชื้อ|विसंक्रमित|कीटाणुरहित/iu;
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&rsquo;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();

module.exports=function controle({OUT,ranked,S100,LISTING,AREAS,STREETS}){
  const problems=[], fixedPages=[];
  /* 5. no document photo (price list, menu) as a thumbnail or a share image */
  let DOCS=new Set();try{DOCS=new Set(JSON.parse(fs.readFileSync('./data/photos-reglages.json','utf8')).documents||[]);}catch(e){}
  const rank=new Map(ranked.map((p,i)=>[p.slug,i]));      /* by slug: several venues share a name (four « Lena Nails and Beauty ») */
  const first=ranked[0];
  const OTHERS=[...new Set(ranked.map(p=>p.name))].filter(n=>n&&n.length>=4).sort((a,c)=>c.length-a.length);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):(e.name==='index.html'?[path.join(d,e.name)]:[]));
  const areaBySlug=new Map(AREAS.map(a=>[a.slug,a]));
  const streetBySlug=new Map((STREETS||[]).map(s=>[s.slug,s]));
  for(const f of walk(OUT)){
    const rel='/'+path.relative(OUT,path.dirname(f)).split(path.sep).join('/')+(f===path.join(OUT,'index.html')?'':'/');
    const url=rel.replace(/^\/\//,'/');
    const b=fs.readFileSync(f,'utf8');
    const title=strip((b.match(/<title>([\s\S]*?)<\/title>/)||[])[1]);
    const h1=strip((b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]);
    const q=strip((b.match(/<p class="ans-q">([\s\S]*?)<\/p>/)||[])[1]);
    const meta=strip((b.match(/<meta name="description" content="([^"]*)"/)||[])[1]);
    const lists=[...b.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch(e){return null;}})
      .filter(j=>j&&j['@type']==='ItemList');
    const els=lists.flatMap(l=>(l.itemListElement||[]).map(x=>({name:(x.item||{}).name||x.name,url:(x.item||{}).url||x.url}))).filter(x=>x.name);
    const items=els.map(x=>x.name);
    const slugOf=x=>{const m=String(x.url||'').match(/\/([^/]+)\/?$/);return m?m[1]:null;};
    const lname=lists.map(l=>l.name||'').join(' ');
    const isVenue=new RegExp(`^${LISTING.path}[^/]+/$`).test(url)&&!/by-google-rating/.test(url);
    const isArea=/\/area\//.test(url), isStreet=/\/street\//.test(url);
    const isJournal=/\/journal\//.test(url);
    { const og=(b.match(/og:image" content="[^"]*\/assets\/places\/([^"]+)"/)||[])[1];
      const th=[...b.matchAll(/class="(?:bl-p|sr-p|ed-p|pick-p)[^"]*"[^>]*>\s*<img[^>]+src="\/assets\/places\/([^"]+)"/g)].map(m=>m[1]);
      for(const x of [og,...th]) if(x&&DOCS.has(x)){ problems.push(`${url} : photo de document (${x}) en vignette ou en image de partage`); break; } }
    { const code=(url.match(/^\/(zh-tw|[a-z]{2})\//)||[])[1];
      if(code&&code!=='en'&&!isJournal&&(SCRIPT[code]||LATIN[code])){
        const lang=(b.match(/<html lang="([^"]+)"/)||[])[1];
        if(lang&&lang!==code) problems.push(`${url} : <html lang="${lang}"> au lieu de ${code}`);
        const rx=SCRIPT[code]||LATIN[code];
        if(!rx.test(title)||!rx.test(h1)) problems.push(`${url} : titre ou H1 pas dans la langue ${code} (« ${title.slice(0,60)} »)`);
        const body=strip(b.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<a [^>]*class="(sr-t|bl-t)"[^>]*>[\s\S]*?<\/a>/g,' '));
        const m=body.match(EN_UI); if(m) problems.push(`${url} : texte anglais resté sur une page ${code} (« ${m[0]} »)`);
      } }

    // 7. sentence starting with a small letter after a full stop
    { const t=strip(ownText(b));
      for(const m of t.matchAll(/([\p{L}\p{N}.)»"”’]+)\. +(\p{Ll}[\p{L}]*)/gu)){
        const tok=m[1].replace(/^[(«"“]+/,''); if(ABBR.test(tok)||/^\p{N}/u.test(tok)&&/^(m|km|min|h)$/.test(m[2])) continue;
        if(/\.\p{L}/u.test(tok)) continue;          /* a domain name, not a sentence end */
        problems.push(`${url} : phrase qui commence par une minuscule (« ${t.slice(Math.max(0,m.index-40),m.index+m[0].length+30)} »)`); break; } }
    // 8. a "top three" claim must name the page's own first venue first
    { const t=strip(ownText(b)); const m=t.match(TOP3);
      if(m&&items.length>=3){ const seg=t.slice(m.index+m[0].length,m.index+m[0].length+400);
        const hits=items.slice(0,40).map(n=>[n,seg.indexOf(n)]).filter(x=>x[1]>=0).sort((a,c)=>a[1]-c[1]);
        if(hits.length&&hits[0][0]!==items[0]) problems.push(`${url} : annonce des « trois premiers » (${hits[0][0]}…) différents du classement de la page (${items[0]})`); } }
    // 9. no steriliser line in the pick's own blocks
    { const pk=strip([...b.matchAll(/<div class="(?:pick-t|why)"[^>]*>([\s\S]*?)<\/div>/g)].map(m=>m[1]).join(' '));
      const m=pk.match(STERI); if(m) problems.push(`${url} : stérilisation dans le bloc du choix du guide (« ${pk.slice(Math.max(0,m.index-50),m.index+40)} »)`); }
    // 4. repetitions
    for(const [k,v] of [['title',title],['h1',h1],['question',q],['meta',meta]]){
      const m=v.match(REPEAT); if(m&&!/\d/.test(m[1])) problems.push(`${url} : « ${m[0]} » répété dans ${k}`);
    }
    // 3. area and street pages name themselves
    if(isArea){
      const slug=url.split('/area/')[1].replace(/\/$/,''); const a=areaBySlug.get(slug);
      if(a&&/^(da nang|đà nẵng|danang)$/i.test(a.name)) problems.push(`${url} : un groupe de lieux porte le nom de la ville (${a.name}) et se lirait comme le classement de la ville`);
      if(a){const labels=[a.name,...['en','fr','vi','ko','zh','ja','ru','de','es','th','it','nl','zh-tw','hi','ms'].map(l=>a.label(l))];
        if(!labels.some(l=>title.toLowerCase().includes(l.toLowerCase()))||!labels.some(l=>h1.toLowerCase().includes(l.toLowerCase()))) problems.push(`${url} : la page de quartier ne nomme pas son quartier (${a.name})`);}
    }
    if(isStreet){
      const slug=url.split('/street/')[1].replace(/\/$/,''); const s=streetBySlug.get(slug);
      if(s&&(!title.includes(s.name)||!h1.includes(s.name))) problems.push(`${url} : la page de rue ne nomme pas sa rue (${s.name})`);
    }
    // 2. ranked lists follow the score (or, on a one-treatment page, the score for that treatment)
    const variant=(b.match(/<meta name="score-variant" content="([^"]+)"/)||[])[1];
    const rankHere=variant&&S100&&S100.totalV?new Map([...ranked].sort((a,c)=>(S100.totalV(c,variant)-S100.totalV(a,variant))||(S100.bayes(c)-S100.bayes(a))||(c.reviews-a.reviews)).map((p,i)=>[p.slug,i])):rank;
    if(items.length>1&&!isJournal&&!/by-google-rating/.test(url)){     /* Google's raw order is published on purpose */
      const idx=els.map(x=>rankHere.has(slugOf(x))?rankHere.get(slugOf(x)):null).filter(x=>x!==null);
      for(let i=1;i<idx.length;i++) if(idx[i]<idx[i-1]){ problems.push(`${url} : liste hors de l'ordre de la note (${items[i-1]} avant ${items[i]})`); break; }
    }
    // 1. city claims carry the city ranking
    const claim=!isArea&&!isStreet&&!isVenue&&!isJournal&&CITY.some(rx=>rx.test(title)||rx.test(h1)||rx.test(q)||rx.test(meta)||rx.test(lname));
    if(claim&&process.env.CONTROLE_DEBUG) console.log('  revendication ville :',url,'| 1er :',items[0]||'(pas de liste)');
    if(claim){
      if(!variant&&items.length&&items[0]!==first.name) problems.push(`${url} : se présente comme le classement de la ville mais commence par ${items[0]} (n° 1 de la ville : ${first.name})`);
      const m=strip(b).match(/1\. ([^()]+?) \((\d+(?:[.,]\d)?)(?:\/100)?\)/);
      if(m&&parseFloat(m[2].replace(',','.'))<60) problems.push(`${url} : top 5 de la ville dont le 1er a ${m[2]}/100 (${m[1]})`);
    }
    // 10. (27/11, lead, after ChatGPT recommended Posh from our page) on a city ranking, the answer opens with the
    //     page's first: its lead paragraph names it, its first two sentences name no other venue, and no other
    //     venue is named before it anywhere in the answer block
    if(claim&&items.length){
      const own=items[0]; let lead='', block='';
      const ansHtml=(b.match(/<div class="ans">([\s\S]*?)<\/div>/)||[])[1];
      if(ansHtml!=null){ const h=ansHtml.replace(/<p class="ans-q">[\s\S]*?<\/p>/,''); const m=h.match(/<p\b[^>]*>([\s\S]*?)<\/p>/); lead=m?strip(m[1]):''; block=strip(h); }
      else { const bc=(b.match(/<div class="prose bcp">([\s\S]*)/)||[])[1]||''; const after=bc.split(/<h2[^>]*>/)[1]||bc;
        const m=after.match(/<p\b[^>]*>([\s\S]*?)<\/p>/); lead=m?strip(m[1]):''; block=strip(after.split(/<h2/)[0]); }
      const two=lead.split(/(?<=[^\d\s][.!?])\s+|(?<=[。！？।])/).filter(x=>x.trim()).slice(0,2).join(' ');
      const other=OTHERS.find(n=>n!==own&&!own.includes(n)&&two.includes(n));
      const firstNamed=[own,...OTHERS].map(n=>[n,block.indexOf(n)]).filter(x=>x[1]>=0).sort((x,y)=>x[1]-y[1]||y[0].length-x[0].length)[0];
      if(!lead.includes(own)) problems.push(`${url} : le bloc réponse ne s'ouvre pas sur le n° 1 de la page (${own}) : « ${lead.slice(0,120)} »`);
      else if(other) problems.push(`${url} : « ${other} » nommé dans les deux premières phrases du bloc réponse (« ${two.slice(0,160)} »)`);
      else if(firstNamed&&firstNamed[0]!==own&&!own.includes(firstNamed[0])) problems.push(`${url} : ${firstNamed[0]} nommé avant ${own} dans le bloc réponse`);
    }
  }
  return problems;
};
