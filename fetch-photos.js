#!/usr/bin/env node
/* Pull freely-licensed photos from Openverse (WordPress' CC search API, no key)
   → docs/assets/ + photos.json with the attribution each licence requires.
   Only CC0 / Public Domain / CC-BY are accepted: BY-SA would force the whole
   page under a share-alike licence, and ND forbids the crops we need. */
const fs=require('fs'),https=require('https'),path=require('path');

const OK_LICENCES=['cc0','pdm','by'];
const OUT='./assets/photos';
const SETS=process.env.PHOTO_SETS?JSON.parse(process.env.PHOTO_SETS):{
  hero:      "manicure nails",
  gel:       "gel nail polish",
  art:       "nail art design",
  pedicure:  "pedicure feet spa",
  salon:     "nail salon interior",
  hands:     "hands manicure care",
  polish:    "nail polish bottles colour",
  danang:    "Da Nang Vietnam beach"
};

const get=(url,headers={})=>new Promise((res,rej)=>{
  https.get(url,{headers:{'User-Agent':'danang-guides/1.0 (+https://danangnails.com)',...headers}},r=>{
    if(r.statusCode>=300&&r.statusCode<400&&r.headers.location) return get(r.headers.location,headers).then(res,rej);
    const chunks=[]; r.on('data',c=>chunks.push(c)); r.on('end',()=>res({status:r.statusCode,buf:Buffer.concat(chunks)}));
  }).on('error',rej);
});

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const manifest={};
  for(const [slug,q] of Object.entries(SETS)){
    const url=`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}`
      +`&license=${OK_LICENCES.join(',')}&page_size=12&mature=false`;
    let list=[];
    try{ list=JSON.parse((await get(url)).buf.toString()).results||[]; }
    catch(e){ console.error('  !',slug,e.message); continue; }

    let saved=null;
    for(const r of list){
      const src=r.url||''; if(!/\.(jpe?g|png)$/i.test(src)) continue;
      try{
        const img=await get(src);
        if(img.status!==200||img.buf.length<25000) continue;   // skip thumbnails/errors
        const file=`${slug}.jpg`;
        fs.writeFileSync(path.join(OUT,file),img.buf);
        saved={file,
          title:r.title||'',
          licence:(r.license||'').toUpperCase()+(r.license_version?' '+r.license_version:''),
          licenceUrl:r.license_url||'',
          creator:r.creator||'Unknown',
          creatorUrl:r.creator_url||'',
          source:r.foreign_landing_url||src,
          bytes:img.buf.length};
        break;
      }catch(e){/* try next candidate */}
    }
    if(saved){ manifest[slug]=saved; console.log(`  ${slug.padEnd(10)} ${saved.licence.padEnd(10)} ${Math.round(saved.bytes/1024)}kB  ${saved.creator.slice(0,28)}`); }
    else console.log(`  ${slug.padEnd(10)} — aucune image exploitable`);
    await new Promise(r=>setTimeout(r,300));
  }
  fs.writeFileSync('./photos.json',JSON.stringify({fetchedAt:new Date().toISOString().slice(0,10),photos:manifest},null,1));
  console.log(`\n${Object.keys(manifest).length}/${Object.keys(SETS).length} photos → assets/photos/ + photos.json`);
})();
