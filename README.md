# headspadanang.com — Head Spa Da Nang

Static site, zero dependencies. `node build.js` reads `places.json` + `journal.js` and writes `./docs`, which GitHub Pages serves at https://headspadanang.com.

## The 30-day clock (read this first)

Google's Places terms cap caching of ratings, review text and photo bytes at **30 days**. `lib/engine.js` enforces it:

| Age of `places.json` | What happens |
|---|---|
| 0 to 24 days | normal build |
| **25 to 30 days** | build passes and prints a `::warning::` annotation in the Actions log |
| **over 30 days** | **build fails**, loudly, with the refresh command in the error |

Set a reminder for **day 25** after each refresh. The date lives in `places.json` under `fetchedAt`:

```bash
node -e 'const j=require("./places.json");const d=Math.floor((Date.now()-new Date(j.fetchedAt))/864e5);console.log(`${j.fetchedAt} — ${d}d old, ${30-d}d left`)'
```

### Refreshing

```bash
FORCE=1 bash ~/.claude/danang-guides/refresh.sh    # both guides: discover, reviews, photos, build, push, resubmit sitemaps
```

or, for this repo alone:

```bash
set -a; . ~/.claude/secrets/seo-apis.env; set +a
node fetch-places.js          # discovery, overwrites places.json (keeps the previous snapshot if the response looks partial)
node fetch-details.js         # reviews + photos, restores reviewList/photoList and sets detailsFetchedAt
node build.js
```

**Run both fetchers, in that order.** `fetch-places.js` writes a fresh but bare `places.json`; committing it without `fetch-details.js` strips the verbatim Google reviews and every photo from all spa pages. A half-finished refresh of exactly this kind sat uncommitted in this working tree from 4 to 12 September 2026.

The LaunchAgent `com.digitalunicorn.danang-refresh` runs `refresh.sh` on the 1st of each month at 04:30. It was bi-monthly until 12/09/2026, which guaranteed the 30-day cap would bite every other month; that is what broke seven consecutive builds from 5 to 11 September 2026.

## Why a build can fail

`lib/engine.js` refuses to produce a site rather than produce a broken one:

- `0 usable listings` — the snapshot is past the cap. Refresh it.
- `FEATURED_ID ... is absent from the N listings` — `fetch-places.js` pins Reborn's place id explicitly, so this means discovery returned a partial set. Re-run it.

Both used to be silent: `PLACES` went empty, the pinned house resolved to `undefined`, and the build died on `.name` while production kept serving a 38-day-old snapshot.

## Editorial rules that are not negotiable

- **No invented spa, rating or review.** Everything in the tables comes from the Google Places API and says so, with the snapshot date under every table.
- The guide's ranking is an editorial order (our pick first, then a bayesian score), the method is printed under each table, and the raw Google order stays published at `/spas/by-google-rating/`.
- Reborn Nails & Retreat works commercially with this guide. That is disclosed wherever the recommendation appears, in every locale, and links placed for it carry `rel="sponsored"`.
- `PLACE_FILTER` in `build.js` keeps grocers, gift shops and souvenir stores out of the set. A souvenir store ranked as the city's 7th best head spa discredits the whole table.
- `author.json` stays absent until a real, consenting person signs off. Never create it with an invented identity.

## Layout

```
build.js          site config, service pages, best-of pages, static pages
lib/engine.js     shared engine (identical in danangnails-site except the Clarity id)
lib/css-spa.js    stylesheet
lib/i18n.js       the nine non-English locales
journal.js        articles, date-gated: nothing publishes before its date
places.json       Google Places snapshot. fetchedAt drives the 30-day clock
docs/             build output, committed, served by GitHub Pages
```

`assets/places/` is gitignored (photos are copied into `docs/` at build time, and carried across the `docs/` wipe when the source folder is absent, which is the case on CI).
