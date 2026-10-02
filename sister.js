/* node sister.js ../headspa-site/places.json
   Writes sister.json: the place ids listed in the other Da Nang guide. Ids only,
   which Google allows to be stored without the 30-day cap that applies to
   ratings and reviews. The build uses them to tell which venues appear in both
   directories (nails and head spa under one roof). Run by refresh.sh. */
const fs=require('fs');
const src=process.argv[2];
if(!src||!fs.existsSync(src)){console.error('usage: node sister.js <other-guide>/places.json');process.exit(1);}
const j=JSON.parse(fs.readFileSync(src,'utf8'));
const ids=[...new Set((j.places||[]).map(p=>p.id))].sort();
if(ids.length<50){console.error(`sister.js: only ${ids.length} ids in ${src}, keeping the previous sister.json`);process.exit(1);}
fs.writeFileSync('./sister.json',JSON.stringify({from:j.fetchedAt,count:ids.length,ids},null,1)+'\n');
console.log(`sister.json: ${ids.length} ids (snapshot ${j.fetchedAt})`);
