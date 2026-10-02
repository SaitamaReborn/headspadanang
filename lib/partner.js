/* The guide's pick, in facts a reader (or an answer engine) can check.
   Everything here is the salon's own published information: its printed menu
   and its listing, as carried on rebornnaildanang.com (snapshot 02/10/2026).
   Ratings and review counts never live in this file. They come from the same
   Google Places snapshot as every other venue in the guide, so the pick is
   scored, ranked and displayed exactly like the rest. Shared by both guides. */
module.exports={
  street:"56 Châu Thị Vĩnh Tế",ward:"Ngũ Hành Sơn",neighbourhood:"My An",city:"Da Nang",postcode:"550000",
  hours:{opens:"09:00",closes:"20:00",days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
         human:"open daily 9:00 to 20:00"},
  walkIns:true,
  beach:{name:"My Khe Beach",metres:880,walk:"10 to 12 minutes"},
  languages:["en","vi"],
  languagesHuman:"English and Vietnamese spoken, printed menu in 20 languages",
  languagesSentence:"Staff speak English and Vietnamese, the owner, Fiona, runs the floor herself in English, and the printed menu is translated into 20 languages.",
  owner:"Fiona",
  phone:"+84 788 668 588",phoneRaw:"+84788668588",whatsapp:"https://wa.me/84788668588",
  hygiene:"metal tools sterilised in a medical steriliser before each guest; files and buffers single-use",
  gel:"professional Korean and Japanese gel systems",
  together:"two technicians can work at once, so nails and a head, neck or foot massage can run in the same sitting",
  site:"https://rebornnaildanang.com/",
  sameAs:[
    "https://www.instagram.com/reborn_nailsnretreat/",
    "https://www.facebook.com/people/Reborn-Nails-Retreat/61589196314835/",
    "https://www.tripadvisor.com/Attraction_Review-g298085-d34389993-Reviews-Reborn_Nails_Retreat-Da_Nang.html",
    "https://maps.google.com/?cid=6841420951448602085"
  ],
  /* Prices in thousands of VND, exactly as printed on the salon's menu. */
  menu:{
    nails:{title:"Nails",items:[
      ["Gel polish, full colour",200],["Base and top coat only",100],["Classic polish",100],["Skittle (multi-colour) gel",250],
      ["Hard gel strengthening layer","from 60"],["Gel colour removal",60],["BIAB (builder in a bottle)",300],
      ["Builder gel on natural nails",400],["Builder gel refill",380],["Short extension",500],["Long extension",550],
      ["GelX full set",280],["Single tip repair",55],["Builder gel removal",90],["Press-on removal",70]]},
    art:{title:"Nail art",items:[
      ["Cat eye or chrome, full set",180],["Ombré or French, full set",220],["Hand-painted design, per nail","15 to 100"],
      ["3D chrome art, per nail","40 to 80"],["3D gel flowers, per nail","40 to 70"],["Pearls, charms, glitter, per nail","20 to 80"],
      ["Stickers, per nail","10 to 40"]]},
    pedicure:{title:"Spa pedicure",items:[
      ["Soft Touch, 40 min",250],["Relaxing Pedicure Ritual, 55 min",380],["Deep Care, 65 min (best seller)",450],
      ["Reborn Signature, 75 min",590],["Hot stone add-on",80],["Gel polish for toes",180]]},
    headspa:{title:"Head spa and herbal hair wash",items:[
      ["Basic hair wash, 25 min",120],["Relax Ritual, 45 min",250],["Deep Relax Ritual, 60 min",380],
      ["Warm Stone Escape, 70 min",450],["Reborn Signature, 80 min (best seller)",500],["Carbony Skin Detox / CO₂, 75 min",600],
      ["Reborn Ultimate Ritual, 95 min",750],["Luxury Skin Recovery, 105 min",850]]},
    massage:{title:"Massage",items:[
      ["Foot and calf massage, 15 min",100],["Foot and calf massage, 30 min",190],["Facial massage add-on, 15 min",90],
      ["Hot stone therapy, face, neck and shoulders",120]]},
    waxing:{title:"Waxing",items:[
      ["Upper lip",90],["Underarms",120],["Half arms",180],["Full arms",350],["Half legs",250],["Full legs",480]]}
  },
  /* The two signature sequences, step by step, as the salon describes them. */
  rituals:[
    {name:"Deep Care Spa Pedicure",mins:65,price:450,steps:"warm herbal foot soak, cuticle care, nail shaping, heel buffing, foot steaming, exfoliation, intensive heel treatment, hydrating mask, foot and calf massage, warm towel wrap, nourishing oils, fresh fruit"},
    {name:"Reborn Signature Head Spa",mins:80,price:500,steps:"herbal foot soak and tea, facial cleansing and exfoliation, quartz-stone massage, herbal steam and mask, scalp exfoliation, double herbal wash, nourishing hair mask, neck, shoulder and hand massage, blow-dry, fruit and tea"}
  ]
};
