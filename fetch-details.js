#!/usr/bin/env node
/* Enrich places.json with real Google reviews + photos (Places API New).
   Run: GOOGLE_PLACES_KEY=... node fetch-details.js

   Google Places terms: photo bytes and review text may be cached for up to 30
   days, and BOTH must carry the author attributions the API returns. build.js
   drops anything older than that and renders the attribution next to the media,
   so nothing is served unattributed or stale. */
const fs=require('fs'),https=require('https'),path=require('path');
const KEY=process.env.GOOGLE_PLACES_KEY;
if(!KEY){console.error('GOOGLE_PLACES_KEY missing');process.exit(1);}

const PHOTO_DIR='./assets/places';
const MAX_PHOTOS=parseInt(process.env.MAX_PHOTOS||'3',10);
const WIDTH=900;
/* Rotating window over each place's photo set, so a refresh shows different
   shots instead of re-downloading the same ones. */
const OFFSET=parseInt(process.env.PHOTO_OFFSET||'0',10);

const req=(opts,body)=>new Promise((res,rej)=>{
  const r=https.request(opts,x=>{
    if(x.statusCode>=300&&x.statusCode<400&&x.headers.location){
      const u=new URL(x.headers.location);
      return req({hostname:u.hostname,path:u.pathname+u.search,method:'GET',headers:{}}).then(res,rej);
    }
    const c=[];x.on('data',d=>c.push(d));x.on('end',()=>res({status:x.statusCode,buf:Buffer.concat(c)}));
  });
  r.on('error',rej); if(body)r.write(body); r.end();
});

const details=id=>req({hostname:'places.googleapis.com',method:'GET',
  path:`/v1/places/${id}?languageCode=en`,
  headers:{'X-Goog-Api-Key':KEY,
    'X-Goog-FieldMask':'reviews,photos,editorialSummary,priceLevel,rating,userRatingCount'}})
  .then(r=>JSON.parse(r.buf.toString()));

const photoBytes=name=>req({hostname:'places.googleapis.com',method:'GET',
  path:`/v1/${name}/media?maxWidthPx=${WIDTH}&key=${KEY}`,headers:{}});

/* places.json is read once at start and written once at the end, so a discovery
   run finishing mid-flight would be silently overwritten. Refuse to start while
   one holds the lock, and hold it ourselves for the duration. */
const LOCK='./.places.lock';
(async()=>{
  if(fs.existsSync(LOCK)){
    const age=(Date.now()-fs.statSync(LOCK).mtimeMs)/60000;
    if(age<90){console.error(`another places job has been running for ${age.toFixed(0)} min — refusing to race it`);process.exit(1);}
    console.warn('stale lock, taking over');
  }
  fs.writeFileSync(LOCK,String(process.pid));
  process.on('exit',()=>{try{fs.unlinkSync(LOCK)}catch(e){}});
  const db=JSON.parse(fs.readFileSync('./places.json','utf8'));
  fs.mkdirSync(PHOTO_DIR,{recursive:true});
  let withRev=0,withPhoto=0,shots=0;

  for(const p of db.places){
    let d;
    try{ d=await details(p.id); }catch(e){ console.error('  !',p.name,e.message); continue; }
    if(d.error){ console.error('  !',p.name,'→',d.error.status); continue; }

    if(d.rating) p.rating=d.rating;
    if(d.userRatingCount) p.reviews=d.userRatingCount;
    if(d.editorialSummary&&d.editorialSummary.text) p.summary=d.editorialSummary.text;

    /* Reviews: keep the text verbatim with its author — never edited, never invented. */
    p.reviewList=(d.reviews||[]).map(r=>({
      rating:r.rating,
      text:((r.text||r.originalText||{}).text||'').trim(),
      lang:(r.text||{}).languageCode||'',
      author:(r.authorAttribution||{}).displayName||'',
      authorUri:(r.authorAttribution||{}).uri||'',
      photoUri:(r.authorAttribution||{}).photoUri||'',
      when:r.relativePublishTimeDescription||'',
      time:r.publishTime||''
    })).filter(r=>r.text.length>25);
    if(p.reviewList.length) withRev++;

    p.photoList=[];
    const pool=d.photos||[];
    const start=pool.length?(OFFSET*MAX_PHOTOS)%pool.length:0;
    const picked=pool.length?[...pool.slice(start),...pool.slice(0,start)].slice(0,MAX_PHOTOS):[];
    for(const ph of picked){
      const idx=p.photoList.length;
      const file=`${p.slug||p.id.slice(-8)}-${idx}.jpg`;
      try{
        const img=await photoBytes(ph.name);
        if(img.status!==200||img.buf.length<12000) continue;
        fs.writeFileSync(path.join(PHOTO_DIR,file),img.buf);
        p.photoList.push({file,
          attribution:(ph.authorAttributions||[]).map(a=>({name:a.displayName||'',uri:a.uri||''})),
          w:ph.widthPx||null,h:ph.heightPx||null});
        shots++;
      }catch(e){/* next photo */}
      await new Promise(r=>setTimeout(r,120));
    }
    if(p.photoList.length) withPhoto++;
    process.stdout.write(`\r  ${db.places.indexOf(p)+1}/${db.places.length}  ${shots} photos, ${withRev} with reviews   `);
    await new Promise(r=>setTimeout(r,180));
  }

  db.detailsFetchedAt=new Date().toISOString().slice(0,10);
  fs.writeFileSync('./places.json',JSON.stringify(db,null,1));
  console.log(`\n\n${withRev}/${db.places.length} places with reviews · ${withPhoto} with photos · ${shots} images in ${PHOTO_DIR}`);
})();
