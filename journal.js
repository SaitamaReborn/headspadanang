/* Head Spa Da Nang · article queue. NEWEST FIRST, date-gated by build.js.
   {slug,title,desc,date,cat,read,tldr:[],body:[{h,p:[]}],faq:[[q,a]]}
   Editorial rules: real prices only (120K–850K range verified on posted menus),
   no invented spas, ratings or reviews. */

const JOURNAL = [
{
  slug: "vietnamese-head-spa-first-time",
  title: "Your first Vietnamese head spa: what actually happens, minute by minute",
  desc: "The full sequence of a Da Nang head spa visit · herbal shampoo, scalp massage, neck and shoulder work, steam · so nothing surprises you but the price.",
  date: "2026-08-05",
  cat: "First visit",
  read: 6,
  tldr: [
    "A head spa is a ritual, not a hair wash · expect 25 to 105 minutes fully reclined.",
    "The double herbal shampoo and scalp massage are the core; face, neck and steam build around them.",
    "You stay clothed throughout; bring nothing and expect dry, styled hair at the end.",
    "Entry rituals start near 120K; the long signature rituals run 500K–850K."
  ],
  body: [
    { h: "Before anything touches your hair",
      p: ["You will be shown a menu of rituals by length · a quick 25-minute wash up to rituals past the hour and a half. Pick by the time you have, not the adjectives. Then you recline on a padded lounger with your neck in a basin cradle, fully clothed, phone away.",
          "That is the whole preparation. No changing rooms, no robes, nothing to bring."] },
    { h: "The first twenty minutes",
      p: ["Warm water, then the first herbal shampoo · often grapefruit peel, locust pod or lemongrass blends · worked in slowly. What separates a head spa from a hair wash is that the technician's hands never rush: every pass across the scalp is also massage.",
          "A second shampoo follows, and by then most first-timers have stopped narrating and started drifting."] },
    { h: "The middle · where the ritual earns its price",
      p: ["Longer rituals layer in a neck and shoulder massage, facial cleansing or a mask, ear candling in some houses, hot stones in others, and a herbal steam that settles over the room like weather. The sequencing varies spa to spa; the constant is unhurried pressure and warmth.",
          "If pressure is ever too much or too little, say so plainly · adjusting is part of the technician's craft and nobody is offended."] },
    { h: "The end, and what to pay",
      p: ["You finish with a towel dry, a blow-dry and usually tea. Expect to have been horizontal for the full booked time · a 60-minute ritual means 60 minutes of hands-on work, not 60 minutes including checkout.",
          "Entry-level washes around 120K, mid-length rituals 250K–450K, and the long signature experiences 500K–850K. The full breakdown lives on our <a href=\"/prices/\">prices page</a>."] }
  ],
  faq: [
    ["Do I need to wash my hair before a head spa?", "No · arriving with unwashed hair is normal and expected. The double shampoo is the treatment. Come as you are."],
    ["Can men go to a head spa in Da Nang?", "Absolutely. Head spas in Vietnam serve everyone, and the scalp, neck and shoulder work is exactly as effective on short hair."],
    ["How long does a head spa take?", "From 25 minutes for a basic wash to over 100 minutes for signature rituals. The 60–80 minute range is the sweet spot for a first visit."],
    ["How much should a head spa cost in Da Nang?", "From about 120K for a short wash to 850K for the longest luxury rituals · a fraction of what comparable treatments cost in Korea or Japan, which is why they are a fixture of Da Nang itineraries."]
  ]
},
{
  slug: "head-spa-prices-da-nang-fair-rates",
  title: "Head spa prices in Da Nang: the fair-rate table for 2026",
  desc: "What each tier of Da Nang head spa ritual should cost in 2026, from the 120K quick wash to 850K signature experiences, and what each price buys.",
  date: "2026-08-08",
  cat: "Prices",
  read: 5,
  tldr: [
    "Quick washes start near 120K; most satisfying first visits sit in the 250K–500K band.",
    "Above 500K you are buying length and layers · steam, stones, facial care · not better hands.",
    "Price scales with minutes: check the ritual's stated length before comparing numbers.",
    "Anything quoted per-service (dry, massage, mask) rather than per-ritual usually costs more in total."
  ],
  body: [
    { h: "The 2026 fair-rate table",
      p: ["Da Nang head spa menus in 2026 cluster into clear tiers. A basic 25-minute herbal wash runs about 120K. Mid-length rituals of 45 to 70 minutes · the double shampoo plus neck, shoulder and facial work · sit between 250K and 450K. The long signature rituals, 80 minutes and beyond with steam, hot stones and skin care layered in, run 500K to 850K.",
          "Those numbers come from posted menus, not negotiation. A spa asking far above them should be offering something visibly beyond the standard sequence."] },
    { h: "What moves a ritual up a tier",
      p: ["Time is the honest multiplier: every tier up buys roughly twenty more minutes of hands-on work. The add-ons that justify a premium are hot stones, herbal steam, CO₂ or detox skin treatments and extended massage segments · each is minutes of trained labour, not a sachet of product.",
          "Be wary of menus that price the wash, the massage and the dry separately. The per-ritual houses are almost always better value and calmer experiences."] },
    { h: "How Da Nang compares",
      p: ["The same ritual structure marketed as a Japanese or Korean head spa in Seoul, Tokyo or Western capitals commonly costs four to eight times Da Nang rates. The technique travelled; the cost base did not. It is the single best-value wellness hour in the city.",
          "For what the sequence itself contains, start with our <a href=\"/what-to-expect/\">first-visit guide</a>."] }
  ],
  faq: [
    ["Why are head spas so cheap in Vietnam?", "Lower rents and wages, plus a deep local tradition of herbal hair washing, keep prices at a fraction of Korean or Japanese equivalents · the sequence and skill are comparable."],
    ["Is a more expensive head spa better?", "Above the mid tier, extra money buys extra minutes and layers (steam, stones, facial care), not better technique. Choose by the time you want to spend horizontal."],
    ["Should I tip after a head spa?", "Tipping is not expected in Vietnam. After a long ritual, a small tip is a kind gesture and never an obligation."]
  ]
}
];

module.exports = { JOURNAL };
