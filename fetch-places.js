#!/usr/bin/env node
/* Pull REAL Da Nang salon data from Google Places API (New) → places.json
   Run:  GOOGLE_PLACES_KEY=... node fetch-places.js
   Google Places terms: place IDs may be stored indefinitely, other content is
   cached for at most 30 days — the daily LaunchAgent re-runs this, and build.js
   refuses to render listings whose fetchedAt is older than MAX_AGE_DAYS.
   Attribution ("data from Google") is rendered on every listing page. */
const fs = require('fs');
const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY missing'); process.exit(1); }

const QUERIES = process.env.PLACE_QUERIES
  ? JSON.parse(process.env.PLACE_QUERIES)
  : ["nail salon Da Nang Vietnam","nail salon An Thuong Da Nang","nail salon My Khe beach Da Nang",
     "nail salon Hai Chau Da Nang","nail art Da Nang","tiem nail Da Nang","manicure pedicure Da Nang"];

const FIELDS = ["places.id","places.displayName","places.formattedAddress","places.shortFormattedAddress",
  "places.rating","places.userRatingCount","places.googleMapsUri","places.websiteUri",
  "places.internationalPhoneNumber","places.location","places.primaryTypeDisplayName",
  "places.regularOpeningHours.weekdayDescriptions","places.businessStatus","places.priceLevel"].join(",");

const post = (body) => new Promise((res, rej) => {
  const data = JSON.stringify(body);
  const req = require('https').request({
    hostname: 'places.googleapis.com', path: '/v1/places:searchText', method: 'POST',
    headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(data),
              'X-Goog-Api-Key':KEY,'X-Goog-FieldMask':FIELDS}
  }, r => { let b=''; r.on('data',c=>b+=c); r.on('end',()=>{ try{res(JSON.parse(b))}catch(e){rej(e)} }); });
  req.on('error', rej); req.write(data); req.end();
});

/* Da Nang bounding box — keeps stray results from other cities out. */
const inDaNang = p => {
  const l = p.location; if (!l) return false;
  return l.latitude > 15.90 && l.latitude < 16.15 && l.longitude > 108.10 && l.longitude < 108.35;
};

const AREAS = [
  {name:"My An & An Thuong", lat:16.048, lng:108.245, r:0.022},
  {name:"My Khe beachfront", lat:16.060, lng:108.247, r:0.020},
  {name:"Hai Chau",          lat:16.065, lng:108.216, r:0.030},
  {name:"Thanh Khe",         lat:16.070, lng:108.190, r:0.030},
  {name:"Son Tra",           lat:16.100, lng:108.250, r:0.045},
];
const area = p => {
  const l=p.location; let best="Da Nang", bd=1e9;
  for (const a of AREAS){ const d=Math.hypot(l.latitude-a.lat,l.longitude-a.lng);
    if (d<a.r && d<bd){bd=d;best=a.name;} }
  return best;
};

/* Places we always want in the set even if a text search misses them
   (a 4.9 with 150 reviews loses to a 5.0 with 1000 in Google's own ordering). */
const PINNED = (process.env.PINNED_PLACE_IDS || "ChIJ4S2_LGIXQjER5UUCohuc8V4").split(",").filter(Boolean);

const getPlace = (id) => new Promise((res, rej) => {
  const req = require('https').request({
    hostname:'places.googleapis.com', path:`/v1/places/${id}?languageCode=en`, method:'GET',
    headers:{'X-Goog-Api-Key':KEY,'X-Goog-FieldMask':FIELDS.replace(/places\./g,'')}
  }, r => { let b=''; r.on('data',c=>b+=c); r.on('end',()=>{ try{res(JSON.parse(b))}catch(e){rej(e)} }); });
  req.on('error', rej); req.end();
});

(async () => {
  const seen = new Map();
  for (const q of QUERIES) {
    const r = await post({textQuery:q, maxResultCount:20, languageCode:"en"});
    if (r.error) { console.error('  !', q, '→', r.error.status, r.error.message); continue; }
    let kept = 0;
    for (const p of (r.places||[])) {
      if (!inDaNang(p) || p.businessStatus === 'CLOSED_PERMANENTLY') continue;
      if (seen.has(p.id)) continue;
      seen.set(p.id, {
        id: p.id,
        name: (p.displayName||{}).text || '',
        address: p.shortFormattedAddress || p.formattedAddress || '',
        area: area(p),
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? 0,
        maps: p.googleMapsUri || '',
        site: p.websiteUri || '',
        phone: p.internationalPhoneNumber || '',
        type: (p.primaryTypeDisplayName||{}).text || '',
        hours: (p.regularOpeningHours||{}).weekdayDescriptions || [],
        lat: p.location.latitude, lng: p.location.longitude
      });
      kept++;
    }
    console.log(`  ${q} → +${kept}`);
    await new Promise(r => setTimeout(r, 400));
  }

  for (const id of PINNED) {
    if (seen.has(id)) { console.log(`  pinned ${id} déjà présent`); continue; }
    const p = await getPlace(id);
    if (p.error || !p.location) { console.error('  ! pinned', id, '→', (p.error||{}).status || 'no data'); continue; }
    seen.set(id, {
      id, name:(p.displayName||{}).text||'', address:p.shortFormattedAddress||p.formattedAddress||'',
      area: area(p), rating:p.rating??null, reviews:p.userRatingCount??0,
      maps:p.googleMapsUri||'', site:p.websiteUri||'', phone:p.internationalPhoneNumber||'',
      type:(p.primaryTypeDisplayName||{}).text||'',
      hours:(p.regularOpeningHours||{}).weekdayDescriptions||[],
      lat:p.location.latitude, lng:p.location.longitude
    });
    console.log(`  pinned ${(p.displayName||{}).text} ajouté`);
  }

  const all = [...seen.values()]
    .filter(p => p.rating && p.reviews >= 20)          // enough signal to be meaningful
    .sort((a,b) => (b.rating - a.rating) || (b.reviews - a.reviews));

  fs.writeFileSync('./places.json', JSON.stringify({
    fetchedAt: new Date().toISOString().slice(0,10),
    source: "Google Places API",
    count: all.length,
    places: all
  }, null, 1));
  console.log(`\n${all.length} salons retenus (note + ≥20 avis) → places.json`);
})();
