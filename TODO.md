# Bug Fix Progress

## ✅ Completed

### `api/index.js` - API Route Handler
- [x] Fixed `runApi` to await the response from `runMiddleware` properly
- [x] Fixed `POST /api/ads` — recaptured `req.body` after middleware (middleware strips it)
- [x] Fixed `PUT /api/ads/:id` — recaptured `req.body` after middleware
- [x] Fixed `DELETE /api/ads/:id` — syntax error (double closing parens in `.then()`)
- [x] Fixed `GET /api/ads/:id` — missing `await` on `Ad.findById()`
- [x] Fixed `POST /api/ads/:id/report` — missing `await` on `Ad.findById()`
- [x] Fixed `GET /api/ads?cat=...` — missing `await` on `Ad.find()`
- [x] Fixed `POST /api/images/upload` — missing `await` on `Ad.findById()`
- [x] Fixed `POST /api/images/delete` — missing `await` on `Ad.findById()`
- [x] Added missing `catch()` handler to report endpoint
- [x] Added missing `catch()` on `PUT /api/ads/:id` media processing

### `public/ad.html` - Ad Detail Page
- [x] Removed duplicate `.floating-actions` CSS block
- [x] Removed duplicate `.lightbox` CSS block
- [x] Removed `<div id="floating-actions">` from HTML
- [x] Removed `renderFloatingActions()` function entirely
- [x] Removed `renderFloatingActions(ad)` call from `renderAd()`
- [x] Fixed `loadRelatedAds()` — removed broken mixed async/then pattern, proper `await` on `fetchJson()`
- [x] Fixed `renderGallery()` — removed duplicate `main.className` assignment and dead `main.onerror` code

