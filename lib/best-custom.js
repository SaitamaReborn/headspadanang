/* Pages written by hand for one query: "best head spa in Da Nang" (EN, at
   /best-head-spa-da-nang/). Same module as the nail guide (danangnails-site,
   lib/best-custom.js), with the content file name as the only change.

   The text lives in content/best-head-spa.<lang>.md so it can be read and
   edited as prose. This module turns it into the site's HTML and takes care of
   three things the prose cannot:

   1. Review links. content/best-head-spa.refs.json maps the first words of a
      quoted review to its address on Google Maps. The link is added right after
      the closing quotation mark, so every quote on the page can be opened.
   2. The 30-day cap. Google's Places terms cap the caching of review text at
      30 days, the same rule lib/engine.js applies to the listings. Past that
      age (front matter "checked"), each linked quote is replaced by a plain
      link to the review, and the build prints a warning: re-read the reviews,
      update the text and the "checked" date.
   3. Schema. FAQ entries come from the "questions" section, the ranked list
      from the front matter ("items": Google place ids, in order), with the
      rating and review count of the current snapshot, like every other list.

   Figures quoted in the prose are dated in the prose. Nothing here computes a
   rank: the order is the editors' and the page says so. */
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'..','content');
const MAX_QUOTE_AGE=30;
const BASE='best-head-spa';

const escH=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function frontMatter(src){
  const m=src.match(/^---\n([\s\S]*?)\n---\n/);
  const meta={};
  if(!m) return {meta,body:src};
  m[1].split('\n').forEach(l=>{const i=l.indexOf(':'); if(i>0) meta[l.slice(0,i).trim()]=l.slice(i+1).trim();});
  return {meta,body:src.slice(m[0].length)};
}

/* **bold** and [text](url). Everything else is escaped. */
function inline(s,relFor){
  let out=escH(s);
  out=out.replace(/\[([^\]]+)\]\((https?:[^)\s]+|\/[^)\s]*)\)/g,(_,t,u)=>
    u.startsWith('/')?`<a href="${u}">${t}</a>`:`<a href="${u}" rel="${relFor(u)}">${t}</a>`);
  return out.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}

function render(md,relFor){
  const lines=md.split('\n'), html=[], faqs=[];
  let h1='', i=0, section='';
  const para=[];
  const flush=()=>{ if(para.length){ html.push(`<p>${inline(para.join(' '),relFor)}</p>`); para.length=0; } };
  while(i<lines.length){
    const l=lines[i];
    if(/^# /.test(l)){ flush(); h1=l.slice(2).trim(); i++; continue; }
    if(/^## /.test(l)){ flush(); section=l.slice(3).trim(); html.push(`<h2>${inline(section,relFor)}</h2>`); i++; continue; }
    if(/^### /.test(l)){ flush(); html.push(`<h3>${inline(l.slice(4).trim(),relFor)}</h3>`); i++; continue; }
    if(/^\|/.test(l)){
      flush();
      const rows=[];
      while(i<lines.length&&/^\|/.test(lines[i])){ rows.push(lines[i]); i++; }
      const cells=r=>r.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=cells(rows[0]), body=rows.slice(2).map(cells);
      /* The row header is the salon's name when the first column is a rank, the first column otherwise. */
      const rowHead=/^(#|N°)$/.test(head[0])?1:0;
      html.push(`<div class="tw"><table class="data bc"><thead><tr>${head.map(c=>`<th scope="col">${inline(c,relFor)}</th>`).join('')}</tr></thead><tbody>${
        body.map(r=>`<tr>${r.map((c,k)=>k===rowHead?`<th scope="row">${inline(c,relFor)}</th>`:`<td>${inline(c,relFor)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if(/^- /.test(l)){
      flush();
      const items=[];
      while(i<lines.length&&/^- /.test(lines[i])){ items.push(lines[i].slice(2)); i++; }
      html.push(`<ul>${items.map(x=>`<li>${inline(x,relFor)}</li>`).join('')}</ul>`);
      continue;
    }
    if(!l.trim()){ flush(); i++; continue; }
    /* Editors' notes (<!-- … -->) stay in the source and never reach the page. */
    if(/^<!--.*-->$/.test(l.trim())){ flush(); i++; continue; }
    /* A paragraph that opens with a bold question is an FAQ entry. */
    const q=l.match(/^\*\*([^*]+\?)\*\*\s*(.+)$/);
    if(q&&/question/i.test(section)){ flush(); faqs.push([q[1].trim(),q[2].trim()]);
      html.push(`<details class="fq" open><summary>${escH(q[1].trim())}</summary><p>${inline(q[2].trim(),relFor)}</p></details>`); i++; continue; }
    para.push(l.trim()); i++;
  }
  flush();
  return {h1,html:html.join('\n'),faqs};
}

/* Adds the link after each quoted review, or swaps the quote for the link once
   the reading is older than the cap. Quotes open with “ or « and close with ” or ». */
function linkQuotes(html,refs,stale,label){
  const missing=[];
  refs.forEach(r=>{
    const needle=escH(r.find);
    const at=html.indexOf(needle);
    if(at<0){ missing.push(r.find); return; }
    const closes=['”',' »','»'].map(c=>html.indexOf(c,at+needle.length-1)).filter(x=>x>=0);
    if(!closes.length){ missing.push(r.find); return; }
    const end=Math.min(...closes), endLen=html.startsWith(' »',end)?2:1;
    const a=`<a class="rv" href="${escH(r.url)}" rel="nofollow noopener">${escH(label)}</a>`;
    if(!stale){ html=html.slice(0,end+endLen)+' '+a+html.slice(end+endLen); return; }
    const opens=['“','«'].map(c=>html.lastIndexOf(c,at)).filter(x=>x>=0);
    const start=opens.length?Math.max(...opens):at;
    html=html.slice(0,start)+a+html.slice(end+endLen);
  });
  return {html,missing};
}

module.exports=function(ctx){
  const {TODAY,ALL_PLACES,PLACES,SITE,LISTING,ITEM_TYPE,FEATURED_ID,ranked,TOPL,MX,S100,DUEL,PTAB}=ctx;
  /* Figures that follow the 100-point score (lib/score100.js) are written as
     tokens in the prose, so the text stays true after every refresh:
     {{TOP5}} the first five with their score, {{N}} the number of venues scored,
     {{SCORE:<place id>}} one venue's score, and a line {{MATRICE:10}} for the
     matrix of the first ten. "items: auto:10" takes the list order from the score. */
  const fillTok=t=>String(t||'')
    .replace(/\{\{TOP5\}\}/g,()=>S100&&ranked?S100.top5(ranked,'en').replace(/\/100/g,''):'')
    .replace(/\{\{TOP5FR\}\}/g,()=>S100&&ranked?S100.top5(ranked,'fr').replace(/\/100/g,'').replace(/\./g,'.').replace(/(\d)\.(\d)/g,'$1,$2'):'')
    .replace(/\{\{N\}\}/g,()=>String((PLACES||[]).length))
    .replace(/\{\{PREMIER\}\}/g,()=>(ranked&&ranked[0])?ranked[0].name:'')       /* the page's first venue and its score (27/11) */
    .replace(/\{\{SCOREPREMIER\}\}/g,()=>(ranked&&ranked[0]&&S100)?String(S100.total(ranked[0])):'')
    .replace(/\{\{DONNEES\}\}/g,()=>S100?S100.dataLine('en'):'')
    .replace(/\{\{DONNEESFR\}\}/g,()=>S100?S100.dataLine('fr'):'')
    .replace(/\{\{RANG:([\w-]+)\}\}/g,(_,id)=>{const i=(ranked||[]).findIndex(p=>p.id===id);if(i<0) return '';const n=i+1,sf=['th','st','nd','rd'],v=n%100;return `${n}${sf[(v-20)%10]||sf[v]||sf[0]} of ${ranked.length}`;})
    .replace(/\{\{SCORE:([\w-]+)\}\}/g,(_,id)=>{const p=(PLACES||[]).find(x=>x.id===id);return p&&S100?String(S100.total(p)):'';});
  const hasPage=p=>PLACES.some(x=>x.id===p.id);
  const relFor=u=>/rebornnaildanang\.com|wa\.me\/84788668588|saitamareborn\.github\.io/.test(u)?'noopener sponsored':'nofollow noopener';
  const refsFile=path.join(DIR,BASE+'.refs.json');
  const refs=fs.existsSync(refsFile)?JSON.parse(fs.readFileSync(refsFile,'utf8')):[];
  const LABEL={en:'Google review',fr:'avis Google'};
  const out={};
  ['en','fr'].forEach(lang=>{
    const f=path.join(DIR,`${BASE}.${lang}.md`);
    if(!fs.existsSync(f)) return;
    const fm=frontMatter(fs.readFileSync(f,'utf8')), meta=fm.meta;
    ['title','description'].forEach(k=>{ if(meta[k]) meta[k]=fillTok(meta[k]); });
    const body=fillTok(fm.body).replace(/^\{\{MATRICE:(\d+)\}\}$/gm,(_,n)=>`@@MATRICE_${n}@@`).replace(/^\{\{DUEL\}\}$/gm,'@@DUEL@@').replace(/^\{\{PRIXMASSAGE\}\}$/gm,'@@PRIXMASSAGE@@');
    const age=meta.checked?Math.floor((new Date(TODAY)-new Date(meta.checked))/864e5):0;
    const stale=age>MAX_QUOTE_AGE;
    if(stale) console.warn(`::warning::content/${BASE}.${lang}.md was checked ${age} days ago: quoted reviews are replaced by links. Re-read the reviews and update "checked".`);
    const r=render(body,relFor);
    const q=linkQuotes(r.html,refs,stale,LABEL[lang]);
    const auto=/^auto:(\d+)$/.exec(meta.items||'');
    const ids=auto?[]:(meta.items||'').split(',').map(s=>s.trim()).filter(Boolean);
    const items=auto&&ranked?ranked.slice(0,+auto[1]):ids.map(id=>ALL_PLACES.find(p=>p.id===id)).filter(Boolean);
    /* Under each numbered entry: the salon's page on this guide and its Google listing. */
    const T={en:['Hours, map and reviews on this guide','Google listing'],fr:['Horaires, plan et avis (fiche en anglais)','Fiche Google']}[lang];
    let htmlOut=q.html.replace(/<p>@@MATRICE_(\d+)@@<\/p>/g,(_,n)=>MX&&ranked?MX(ranked,lang,{limit:+n}):'');
    htmlOut=htmlOut.replace(/<p>@@DUEL@@<\/p>/g,()=>DUEL?`<div class="ans ans-duel">${DUEL(lang)}</div>`:'').replace(/<p>@@PRIXMASSAGE@@<\/p>/g,()=>PTAB?PTAB(lang):'');
    items.forEach((p,i)=>{
      const m=htmlOut.match(new RegExp(`<h3>${i+1}\\. [^<]*</h3>`));
      if(!m) return;
      const links=[hasPage(p)?`<a href="${LISTING.path}${p.slug}/">${T[0]}</a>`:'',
        p.maps?`<a href="${escH(p.maps)}" rel="${p.id===FEATURED_ID?'noopener sponsored':'nofollow noopener'}">${T[1]}</a>`:''].filter(Boolean).join(' · ');
      if(links) htmlOut=htmlOut.replace(m[0],`${m[0]}\n<p class="m bcl">${links}</p>`);
    });
    const listLd={"@context":"https://schema.org","@type":"ItemList","name":r.h1,"description":meta.description,
      "numberOfItems":items.length,"itemListOrder":"https://schema.org/ItemListOrderAscending",
      "itemListElement":items.map((p,i)=>({"@type":"ListItem","position":i+1,
        "item":{"@type":ITEM_TYPE,"name":p.name,
          ...(hasPage(p)?{"url":`${SITE}${LISTING.path}${p.slug}/`}:{}),
          "address":{"@type":"PostalAddress","streetAddress":p.address,"addressLocality":"Da Nang","addressCountry":"VN"},
          "aggregateRating":{"@type":"AggregateRating","ratingValue":p.rating,"reviewCount":p.reviews,"bestRating":5}}}))};
    out[lang]={title:meta.title||r.h1,desc:meta.description||'',crumb:meta.crumb||'',h1:r.h1,html:htmlOut,faqs:r.faqs,listLd,checked:meta.checked,stale,
      missing:q.missing,items};
  });
  /* A reference used by no language is a typo in refs.json or a quote that was edited. */
  const langs=Object.keys(out);
  const orphan=refs.map(r=>r.find).filter(x=>langs.length&&langs.every(l=>out[l].missing.includes(x)));
  if(orphan.length) console.warn(`::warning::best-custom: ${orphan.length} review reference(s) match no text: ${orphan.join(' | ').slice(0,300)}`);
  return out;
};
