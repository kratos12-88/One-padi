# OnePadi

Ten existing Nigerian web apps compiled into one ecosystem. The home directory offers search, category filters, saved quick access, and a combined record overview. Settings includes a practical guide to all ten tools, quick access and display preferences, workspace status, and an export of all available records. Each app remains a complete, individually branded product at `/apps/<id>/` with an ecosystem switcher. No iframe or outbound handoff is required.

## Products

ChowCart, RentSmall, WayGo, SurePlug, WorkChop, LightPadi, PricePal, FlipAm, ShopPadi, and BorrowBeta. Their source snapshots live in `apps/`. The standalone GitHub repositories remain independent. Changes made later to a standalone repo require copying that change into this ecosystem and rebuilding.

## Run

Node 24 is recommended. There are no runtime dependencies.

```bash
npm run build
npm start
# http://localhost:3000
npm test
```

`scripts/build.mjs` copies each app's front end to `dist/apps/`, updates absolute asset/API paths for this domain, and adds the OnePadi switcher. The product's original client, catalogue, logo, and API handler stay intact. `api/records.js` dispatches a validated product ID to the matching handler. Local SQLite data is shared by one server and namespaced by product. A signed anonymous cookie makes all ten private workspaces visible under this origin.

## Deploy

Create one Vercel project from this repository with Framework: Other, Build Command: `npm run build`, Output Directory: `dist`. The root Vercel function at `api/records.js` dispatches product records.

For persistent cloud records, set `SESSION_SECRET` to a new random value of at least 32 bytes and set `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your Redis REST storage. Keep secrets out of git. With no cloud storage, the UI falls back to browser-local demo records. The home overview includes server and browser-demo records where each is available. The source apps use the same session cookie name; do not mount unrelated apps under this domain.

## Scope

The catalogues and prices are illustrative. Requests are not transmitted to providers, availability is not verified, and payments are not collected. Records on standalone app domains do not migrate automatically into this new domain. There is no account or cross-device sync. The local SQLite and Redis read-modify-write record store is not designed for high-volume concurrent writes. Production commerce needs provider onboarding, inventory, payment processing, customer identity, notifications, and operations tooling.
