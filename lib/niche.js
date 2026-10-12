/* Niche and comparison pages (decision 12/10/2026), shared by both guides.
   Content lives in niche.json at the repo root: plain text, run through
   ~/.claude/lib/passe_humaine.py before it is committed. This file only lays it
   out and fills the live figures.

   Drip: a page is built, linked and listed in the sitemap only once its
   `date` has come (the daily CI build publishes it). Nothing is backdated.

   Kinds
   - "vs":   the pick against one named venue, side by side. Google figures come
             from the snapshot for both; what is said about the other venue
             comes from its own website or listing (sourced in niche.json),
             and where we have not checked something the cell says so.
   - "list": the pick first, then the venues that show evidence for the
             intent, ordered by the guide's score. The evidence is printed on
             every line: the venue's Google listing name, a sentence from one of
             its Google reviews, or its name written in the reader's script.

   Placeholders filled here: {N} {R} {V} {date} for the pick, {rN} {rR} {rV}
   {rA} for the other venue, {dist} metres between the two, {n} venues in the
   list, {total} venues in the guide. */
const fs=require('fs');

const L10N={
 en:{rating:'Google rating',reviews:'reviews',growth:'Google reviews over time',hours:'Opening hours',address:'Address',
   dist:'Distance between the two',m:'m',daily:'Daily',ask:'Ask the salon',crumb:'Guide',faq:'Frequently asked questions',
   evName:'Google listing name',evRev:'Google review',evScript:'Name on Google',pick:'Our pick',
   more:'More comparisons',list:'The list',snap:'Data snapshot',profile:'Hours, map and reviews',maps:'Google Maps',
   notIn:'not in the current snapshot',to:'to',on:'on',cmpH:'Side by side',why:'Why it is here'},
 vi:{rating:'Đánh giá Google',reviews:'đánh giá',growth:'Số đánh giá Google theo thời gian',hours:'Giờ mở cửa',address:'Địa chỉ',
   dist:'Khoảng cách giữa hai tiệm',m:'m',daily:'Mỗi ngày',ask:'Hỏi trực tiếp tiệm',crumb:'Hướng dẫn',faq:'Câu hỏi thường gặp',
   evName:'Tên trên Google',evRev:'Đánh giá Google',evScript:'Tên trên Google',pick:'Lựa chọn của chúng tôi',
   more:'So sánh khác',list:'Danh sách',snap:'Dữ liệu ngày',profile:'Giờ, bản đồ và đánh giá',maps:'Google Maps',
   notIn:'không có trong dữ liệu hiện tại',to:'đến',on:'ngày',cmpH:'So sánh trực tiếp',why:'Vì sao có mặt'},
 ko:{rating:'구글 평점',reviews:'리뷰',growth:'구글 리뷰 수 변화',hours:'영업시간',address:'주소',
   dist:'두 곳 사이 거리',m:'m',daily:'매일',ask:'매장에 문의',crumb:'가이드',faq:'자주 묻는 질문',
   evName:'구글 등록 이름',evRev:'구글 리뷰',evScript:'구글 등록 이름',pick:'에디터 추천',
   more:'다른 비교',list:'목록',snap:'데이터 기준일',profile:'영업시간·지도·리뷰',maps:'구글 지도',
   notIn:'현재 데이터에 없음',to:'→',on:'',cmpH:'한눈에 비교',why:'선정 근거'},
 zh:{rating:'谷歌评分',reviews:'条评价',growth:'谷歌评价数量变化',hours:'营业时间',address:'地址',
   dist:'两店距离',m:'米',daily:'每天',ask:'请向店家确认',crumb:'指南',faq:'常见问题',
   evName:'谷歌上的店名',evRev:'谷歌评价',evScript:'谷歌上的店名',pick:'编辑推荐',
   more:'更多对比',list:'名单',snap:'数据日期',profile:'营业时间、地图和评价',maps:'谷歌地图',
   notIn:'不在当前数据中',to:'→',on:'',cmpH:'并排对比',why:'入选理由'},
 ja:{rating:'Google評価',reviews:'件',growth:'Googleレビュー数の推移',hours:'営業時間',address:'住所',
   dist:'2店の距離',m:'m',daily:'毎日',ask:'店舗に確認',crumb:'ガイド',faq:'よくある質問',
   evName:'Googleの店名',evRev:'Googleレビュー',evScript:'Googleの店名',pick:'編集部のおすすめ',
   more:'ほかの比較',list:'リスト',snap:'データ取得日',profile:'営業時間・地図・レビュー',maps:'Googleマップ',
   notIn:'現在のデータにありません',to:'→',on:'',cmpH:'並べて比較',why:'選んだ理由'},
 ru:{rating:'Оценка в Google',reviews:'отзывов',growth:'Число отзывов в Google',hours:'Часы работы',address:'Адрес',
   dist:'Расстояние между салонами',m:'м',daily:'Ежедневно',ask:'Уточните в салоне',crumb:'Гид',faq:'Частые вопросы',
   evName:'Название в Google',evRev:'Отзыв в Google',evScript:'Название в Google',pick:'Наш выбор',
   more:'Другие сравнения',list:'Список',snap:'Данные на',profile:'Часы, карта и отзывы',maps:'Google Карты',
   notIn:'нет в текущих данных',to:'→',on:'',cmpH:'Сравнение',why:'Почему в списке'}
};

module.exports=function niche(X){
  const {cfg,page,head,nav,locNav,footer,ld,esc,stars,r1,human,LISTING,ranked,score,PLACES,ALL_PLACES,
         featured,RF,whyBox,REACH,rel,SITE,TODAY,PLACES_DATE,km,authorLd,NAME,ITEM_TYPE,hideRivals}=X;
  const file=cfg.NICHE_FILE||'./niche.json';
  if(!fs.existsSync(file)||!featured) return [];
  const ALL=(JSON.parse(fs.readFileSync(file,'utf8')).pages||[]);
  const live=ALL.filter(n=>n.date&&n.date<=TODAY);
  const inGuide=new Map(PLACES.map(p=>[p.id,p]));
  const anyById=new Map(ALL_PLACES.map(p=>[p.id,p]));
  const loc=code=>code==='en'?'en-GB':code==='zh'?'zh-CN':code;
  const dl=(d,code)=>{try{return new Date(d+'T00:00:00Z').toLocaleDateString(loc(code),{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});}catch(e){return d;}};
  const num=(n,code)=>Number(n).toLocaleString(loc(code));
  /* Google's weekday lines ("Monday: 9:00 AM – 8:00 PM") as one 24-hour range
     when every day is the same, so no dash from Google's formatting reaches the page. */
  const hoursOf=(p,T)=>{
    const h=(p&&p.hours)||[]; if(!h.length) return T.ask;
    const to24=s=>{const m=String(s).match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);if(!m) return null;let hh=+m[1]%12;if(/pm/i.test(m[3]))hh+=12;return `${hh}:${m[2]}`;};
    const spans=h.map(x=>{const t=String(x).split(/:\s(.+)/)[1]||'';const ps=t.split(/\s*[–—-]\s*/);return ps.length===2?[to24(ps[0]),to24(ps[1])]:null;});
    if(spans.every(s=>s&&s[0]&&s[1]&&s[0]===spans[0][0]&&s[1]===spans[0][1])) return `${T.daily} ${spans[0][0]} ${T.to} ${spans[0][1]}`;
    return T.ask;
  };
  const hist=id=>{
    if(!RF) return null;
    if(id===featured.id) return ((RF.faits||{}).historique_avis||{}).valeur||null;
    const r=Object.values(RF.rivaux_cites_par_chatgpt||{}).find(x=>x&&x.id===id);
    return r?r.historique:null;
  };
  const growth=(p,code,T)=>{
    const h=hist(p.id); if(!h||!h.length||!PLACES_DATE) return null;
    const [d0,v0]=h[0]; if(d0>=PLACES_DATE) return null;
    return `${num(v0,code)} (${dl(d0,code)}) ${T.to} ${num(p.reviews,code)} (${dl(PLACES_DATE,code)})`;
  };
  const fill=(t,v)=>String(t==null?'':t).replace(/\{(\w+)\}/g,(m0,k)=>v[k]!=null?String(v[k]):m0);
  const link=p=>inGuide.has(p.id)?`${LISTING.path}${p.slug}/`:(p.maps||'');
  const linkRel=p=>inGuide.has(p.id)?'':` rel="${rel(p)}"`;

  /* the evidence lists */
  const evidence=(n,p)=>{
    const s=n.list||{};
    if(s.type==='review'){
      /* A sentence that says the staff do NOT speak the language is evidence
         against, not for: s.not drops it ("don't speak much English"). */
      const re=new RegExp(s.re,s.flags||'i'), no=s.not?new RegExp(s.not,'i'):null;
      for(const r of (p.reviewList||[])){
        const t=String(r.text||''); if(!re.test(t)) continue;
        const sent=t.split(/(?<=[.!?])\s+/).find(x=>re.test(x)&&!(no&&no.test(x)));
        if(!sent) continue;
        return {q:sent.trim().length>220?sent.trim().slice(0,217)+'…':sent.trim(),by:r.author||''};
      }
      return null;
    }
    const re=new RegExp(s.re,s.flags||'i');
    return re.test(p.name)?{name:p.name}:null;
  };
  const buildList=n=>{
    const s=n.list||{};
    const pool=(s.scope==='all'?ALL_PLACES:PLACES).filter(p=>p.id!==featured.id)
      .filter(p=>!s.areas||s.areas.includes(p.area))
      .filter(p=>!s.need||new RegExp(s.need,'i').test(p.name));
    const rows=hideRivals(pool.map(p=>({p,e:evidence(n,p)})).filter(x=>x.e).map(x=>Object.assign(x.p,{_e:x.e}))
      .sort((a,b)=>(score(b)-score(a))||(b.reviews-a.reviews))).slice(0,s.max||10);
    return [featured,...rows];
  };

  const rendered=[];
  live.forEach(n=>{
    const code=n.lang||'en', T=L10N[code]||L10N.en;
    const url=SITE+n.path;
    const rv=n.rival?(anyById.get(n.rival)||null):null;
    const V={N:featured.name,R:r1(featured.rating),V:num(featured.reviews,code),date:dl(PLACES_DATE,code),
      total:PLACES.length,pickUrl:link(featured),
      ...(rv?{rN:rv.name,rR:r1(rv.rating),rV:num(rv.reviews,code),rA:rv.address,
        dist:num(Math.round(km(featured.lat,featured.lng,rv.lat,rv.lng)*1000/10)*10,code)}:{})};
    const list=n.kind==='list'?buildList(n):null;
    if(list) V.n=list.length;
    const F=x=>fill(x,V);
    /* hreflang: the published pages of the same group */
    const sibs=live.filter(x=>x.group&&x.group===n.group);
    const alts=sibs.length>1?sibs.map(x=>`<link rel="alternate" hreflang="${x.lang||'en'}" href="${SITE}${x.path}">`).join('')
      +(sibs.find(x=>(x.lang||'en')==='en')?`<link rel="alternate" hreflang="x-default" href="${SITE}${sibs.find(x=>(x.lang||'en')==='en').path}">`:''):'';
    const faq=(n.faq||[]).map(f=>[F(f.q),F(f.r)]);
    const items=list||(rv?[featured,rv]:[featured]);
    /* kind "guide": an article with no ranking, so no ItemList and no booking buttons. */
    const isGuide=n.kind==='guide';
    const LD=ld({"@context":"https://schema.org","@type":"Article","headline":F(n.h1),"description":F(n.desc),
        "inLanguage":code,"datePublished":n.date,"dateModified":PLACES_DATE>n.date?PLACES_DATE:n.date,"mainEntityOfPage":url,
        "author":authorLd(),"publisher":{"@type":"Organization","name":NAME,"url":SITE+"/"},
        ...(isGuide?{}:{"about":items.slice(0,2).map(p=>({"@type":ITEM_TYPE,"name":p.name}))})})
      +(faq.length?ld({"@context":"https://schema.org","@type":"FAQPage","inLanguage":code,"mainEntity":
        faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}):'')
      +(isGuide?'':ld({"@context":"https://schema.org","@type":"ItemList","name":F(n.h1),"inLanguage":code,"numberOfItems":items.length,
        "itemListOrder":"https://schema.org/ItemListOrderDescending",
        "itemListElement":items.map((p,i)=>({"@type":"ListItem","position":i+1,
          ...(i===0&&n.pickWhy?{"description":F(n.pickWhy)}:{}),
          "item":{"@type":ITEM_TYPE,"name":p.name,...(link(p).startsWith('/')?{"url":SITE+link(p)}:{}),
            "address":{"@type":"PostalAddress","streetAddress":p.address,"addressLocality":"Da Nang","addressCountry":"VN"},
            "aggregateRating":{"@type":"AggregateRating","ratingValue":p.rating,"reviewCount":p.reviews,"bestRating":5}}}))}))
      +ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":T.crumb,"item":SITE+(code==='en'?'/':`/${code}/`)},
        {"@type":"ListItem","position":2,"name":F(n.h1),"item":url}]});

    const cmp=rv?`<h2>${esc(T.cmpH)}</h2><div class="tw"><table class="cmp"><thead><tr><th></th>
<th><a href="${link(featured)}">${esc(featured.name)}</a> · ${esc(T.pick)}</th>
<th>${link(rv)?`<a href="${link(rv)}"${linkRel(rv)}>${esc(rv.name)}</a>`:esc(rv.name)}</th></tr></thead><tbody>
<tr><th scope="row">${esc(T.rating)}</th><td>${r1(featured.rating)} ${stars(featured.rating)} · ${num(featured.reviews,code)} ${esc(T.reviews)}</td><td>${r1(rv.rating)} ${stars(rv.rating)} · ${num(rv.reviews,code)} ${esc(T.reviews)}</td></tr>
<tr><th scope="row">${esc(T.hours)}</th><td>${esc(hoursOf(featured,T))}</td><td>${esc(hoursOf(rv,T))}</td></tr>
<tr><th scope="row">${esc(T.address)}</th><td>${esc(featured.address)}</td><td>${esc(rv.address)}</td></tr>
${(n.rows||[]).map(r=>`<tr><th scope="row">${esc(F(r.k))}</th><td>${esc(F(r.a))}</td><td>${esc(F(r.b))}</td></tr>`).join('')}
<tr><th scope="row">${esc(T.dist)}</th><td colspan="2">${V.dist} ${esc(T.m)}</td></tr>
</tbody></table></div>
<p class="ev">${esc(F(n.sourceNote||''))}</p>`:'';

    const listHtml=list?`<h2>${esc(F(n.listH||T.list))}</h2><ol class="bl">${list.map((p,i)=>`<li class="bl-i${i===0?' is-pick':''}">
<div class="bl-n">${i+1}</div><div class="bl-b">
<h3>${link(p)?`<a href="${link(p)}"${linkRel(p)}>${esc(p.name)}</a>`:esc(p.name)}${i===0?` <span class="badge">${esc(T.pick)}</span>`:''}</h3>
<p class="bl-m">${esc(p.area)} · ${esc(p.address)}</p>
<p class="rating"><b>${r1(p.rating)}</b> ${stars(p.rating)} <span class="rc">${num(p.reviews,code)} ${esc(T.reviews)}</span></p>
<p class="bl-w"><strong>${esc(T.why)}:</strong> ${i===0?esc(F(n.pickWhy||'')):p._e.q?`${esc(T.evRev)}${p._e.by?` (${esc(p._e.by)})`:''}: “${esc(p._e.q)}”`:`${esc((n.list||{}).type==='script'?T.evScript:T.evName)}: “${esc(p._e.name)}”`}</p>
${inGuide.has(p.id)?`<p class="bl-a"><a href="${link(p)}">${esc(T.profile)} →</a>${p.maps?` · <a href="${p.maps}" rel="${rel(p)}">${esc(T.maps)}</a>`:''}</p>`:p.maps?`<p class="bl-a"><a href="${p.maps}" rel="${rel(p)}">${esc(T.maps)}</a></p>`:''}
</div>${(p.photoList||[]).length?`<figure class="bl-p"><img src="/assets/places/${p.photoList[0].file}" alt="${esc(p.name)}" loading="lazy" width="400" height="300"></figure>`:''}</li>`).join('')}</ol>
<p class="ev">${esc(F(n.sourceNote||''))}</p>`:'';

    /* The guide on fake reviews links to no comparison page: no salon is named anywhere near it. */
    const more=live.filter(x=>x!==n&&(x.lang||'en')===code&&!(isGuide&&x.kind==='vs'));
    page(n.path.replace(/\/$/,''),
      head(F(n.title),F(n.desc),url,'',{lang:code,alts})
      +LD
      +(code==='en'?nav(''):locNav(code,''))
      +`<div class="wrap"><nav class="crumb"><a href="${code==='en'?'/':`/${code}/`}">${esc(T.crumb)}</a> → <span>${esc(F(n.h1))}</span></nav></div>
<section class="wrap">
<header class="ph" style="max-width:66ch"><p class="eyebrow">${esc(T.snap)} ${esc(dl(PLACES_DATE,code))}</p>
<h1>${esc(F(n.h1))}</h1>${n.lede?`<p class="lede">${esc(F(n.lede))}</p>`:''}</header>
<div class="ans"><p class="ans-q">${esc(F(n.q))}</p><p>${esc(F(n.answer))}</p></div>
${n.kind==='list'?whyBox(n.path,code):''}
${cmp}${listHtml}
<div class="prose">${(n.sections||[]).map(s=>`<h2>${esc(F(s.h))}</h2>${(s.p||[]).map(x=>`<p>${F(x)}</p>`).join('')}`).join('')}</div>
${n.verdictH?`<h2>${esc(F(n.verdictH))}</h2><div class="prose"><p>${F(n.verdict)}</p></div>`:''}
${isGuide?'':REACH}
${faq.length?`<h2>${esc(T.faq)}</h2><div class="faq">${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`:''}
${more.length?`<h2>${esc(T.more)}</h2><div class="chips">${more.map(x=>`<a class="chip" href="${x.path}">${esc(fill(x.h1,V))}</a>`).join('')}</div>`:''}
</section>`+footer(),'0.85',n.date);
    rendered.push({path:n.path,lang:code,h1:F(n.h1),answer:F(n.answer),q:F(n.q),group:n.group});
  });
  return rendered;
};
