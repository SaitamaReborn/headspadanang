/* City-wide head spa prices, from houses that publish their own.
   Until October 2026 the "typical" tables on this site were one salon's menu
   (the guide's pick) presented as the city norm. They are now computed from
   every Da Nang house we found with a public price list, the pick included as
   one house among six, and each band says how many houses it rests on.
   Only plain hair-wash / head-spa services count: combos with a full-body
   massage and four- or six-hands rituals are left out. Prices in thousands
   of VND, as published. Checked 02/10/2026; re-check before each refresh. */
const CHECKED='2026-10-02';
const HOUSES=[
  {name:"Herbal Spa",source:"https://herbalspa.vn/en/herbal-spa-menu/herbal-spa-menu-56.html",
   items:[[45,550],[60,650],[90,900]]},
  {name:"Len Spa",source:"https://lenspadanang.com/",
   items:[[30,200],[45,300],[60,390],[90,570]]},
  {name:"Panda Spa",source:"https://pandaspa.vn/tin-tuc/the-herbal-head-spa-price",
   items:[[60,550],[90,700]]},
  {name:"Tigon Massage",source:"https://tigonmassa.com/goi-dau-duong-sinh-da-nang",
   items:[[30,350],[60,500]]},
  {name:"YURURI Japanese Head Spa",source:"https://danang.style/tourism/1484",sourceNote:"menu published by Danang Style",
   items:[[30,350],[45,500],[60,600],[90,850]]},
  {name:"Reborn Nails & Retreat",source:"https://rebornnaildanang.com/services/head-spa-hair-wash/",
   items:[[25,120],[45,250],[60,380],[70,450],[80,500]]}
];
const BANDS=[{key:"b0",min:25,max:30},{key:"b1",min:45,max:45},{key:"b2",min:60,max:60},{key:"b3",min:70,max:90}]
  .map(b=>{
    const hits=HOUSES.map(h=>h.items.filter(([m])=>m>=b.min&&m<=b.max).map(([,p])=>p)).filter(a=>a.length);
    const all=hits.flat();
    return {...b,lo:Math.min(...all),hi:Math.max(...all),n:hits.length};
  });
const fmt=b=>`${b.lo}K – ${b.hi}K`;
const range=Object.fromEntries(BANDS.map(b=>[b.key,fmt(b)]));
module.exports={CHECKED,HOUSES,BANDS,range,
  N:HOUSES.length,
  LO:Math.min(...BANDS.map(b=>b.lo)),HI:Math.max(...BANDS.map(b=>b.hi))};
