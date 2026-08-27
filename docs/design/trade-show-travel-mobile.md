# Handoff: Trade Show Travel — mobile app (NAC 2026)

**Target repo:** `Mrvgardner/SCCCMarketingDatabase` (branch `main`)
**Suggested branch:** `design/trade-show-travel-mobile`

```bash
git checkout main && git pull
git checkout -b design/trade-show-travel-mobile
```

Then open Claude Code in the repo root and paste the prompt in `CLAUDE_CODE_PROMPT.md` (next to this file).

---

## Overview

A mobile-first experience for anyone at Switch Commerce traveling on company spend to a trade show. It answers the four questions people actually open their phone for during show week: *how long until I fly, what do I still owe, where am I supposed to be, and where is the booth.*

Three navigation directions were explored. **`1a` (tab bar) is the recommended one to build** — it is the only direction with all five screens designed. `1b` and `1c` are alternate home-screen/nav treatments included for reference; do not build them unless asked.

The design is currently a **web prototype**. In this repo it should land as routes inside the existing Vite + React + Tailwind PWA (there is already a service worker, PWA manifest, offline receipt queue, and Netlify Identity auth), not as a new app.

## About the design files

The files in this bundle are **design references created in HTML** — a prototype showing intended look and behavior, not production code to copy. `Trade Show Travel App.dc.html` uses a bespoke streaming-template runtime (`support.js`, `x-import`, `sc-if`, `sc-for`) that is **not** part of the target codebase and must not be ported.

Recreate the screens as React components in the existing environment:

- React 18 + Vite, `react-router-dom` routes (see `src/main.jsx`)
- Tailwind CSS with the existing config (`tailwind.config.js`: `brand-blue #002b5e`, `brand-orange #ff4f00`, `font-switch-bold`, `font-switch-reg`)
- `@heroicons/react/24/outline` for icons (already a dependency, already used in `EventExpenses.jsx`)
- Existing data + API layers — **do not invent new ones**: `src/data/tradeShows.js`, `src/api/tradeShows.js`, `src/api/expenses.js`, `src/api/receiptQueue.js`, `src/data/expenseCategories.js`, `netlify/functions/flight-lookup.js`

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and interaction states. Recreate pixel-faithfully using Tailwind utilities mapped to the token table below. Where a value has no Tailwind equivalent, use an arbitrary value (`text-[13px]`, `bg-white/[0.045]`) — the existing codebase already does this.

Reference viewport: **402 × 874** (iPhone 16 Pro logical size). The prototype's device bezel, status bar, and home indicator come from a mock device frame and are **not** part of the deliverable.

---

## Design tokens

### Color

| Token | Hex | Use |
| --- | --- | --- |
| Canvas | `#05101F` | App background (cool-black derived, matches brand Cool Black family) |
| Brand Cool Black | `#002B5E` | `1c` full-bleed field, avatar fill |
| RYB Blue (primary) | `#0951FA` | Primary buttons, active tab, links, progress fill, "Elevators" marker |
| Route/attention accent | `#FF4F00` | Blocking items, required team calls, booth marker, route line |
| Slate Gray | `#75808D` | Tertiary text, inactive tabs, eyebrow labels |
| Body text muted | `#93A0B4` | Secondary body copy (lightened Slate Gray for AA contrast on canvas) |
| White | `#FFFFFF` | Primary text |
| Success | `#10B981` | "Ready" receipt pill, completed checklist |
| Warning | `#F59E0B` | "Review" receipt pill, readiness count, finalize CTA |
| Surface | `rgba(255,255,255,0.045)` | Card fill |
| Surface border | `rgba(255,255,255,0.10)` | Card border |
| Hairline | `rgba(255,255,255,0.07)` | Row separators |
| Tab bar fill | `rgba(255,255,255,0.03)` | Bottom bar |

Existing repo values reused verbatim: `#002b5e`, `#ff4f00`, `#0951fa`, `#10b981`, `#f59e0b`, `#ef4444`.

### Typography

Two families:

- **Brand display** — `SWITCH COMMERCE BOLD` / `SWITCH COMMERCE REG`, already installed at `public/fonts/` and declared in `src/fonts.css` (Tailwind: `font-switch-bold`, `font-switch-reg`). Always uppercase, letter-spaced. Used **only** for: countdown numerals, the money total, day-of-week abbreviations, and eyebrow labels.
- **UI** — `-apple-system, system-ui, sans-serif` for everything else.

| Role | Spec |
| --- | --- |
| Countdown numeral (`1a`) | brand bold, 96px / 0.82, letter-spacing −0.01em, white |
| Countdown numeral (`1c`) | brand bold, 150px / 0.78, letter-spacing −0.03em, white |
| Money total | brand bold, 46px / 0.9, white; cents 18px, `#75808D` |
| Screen title | UI 700, 30px / 1.1, white |
| Map screen title | UI 700, 26px / 1.15, white |
| Show name | UI 700, 19px / 1.25, white |
| Card title | UI 700, 15–17px / 1.25, white |
| Row title | UI 600, 14–14.5px / 1.25, white |
| Body | UI 400, 13px / 1.5–1.55, `#93A0B4` |
| Small body | UI 400, 12–12.5px / 1.4–1.5, `#93A0B4` |
| Eyebrow | brand reg or UI 600, 10px / 1, letter-spacing 0.14–0.16em, uppercase, `#75808D` |
| Tab label | UI 600, 10px / 1, letter-spacing 0.04em |
| Status pill | UI 700, 9.5px / 1, letter-spacing 0.08em, uppercase |

### Spacing, radius, shadow

- Screen horizontal padding **18px**; content top padding **62px** (below status bar); bottom padding **18px** above the tab bar.
- Vertical rhythm between cards **12–14px**; between sections **16–22px**.
- Radius: cards **16px**, sub-cards/segments **14px**, buttons **12–14px**, pills **5px**, avatars/dots **50%**, sheet **26px top corners**.
- Every tappable row/target is **≥44px** tall; primary buttons **52px**; tab items **44px** incl. padding.
- Only shadow in the app: the `1b` floating dock — `0 12px 34px rgba(0,0,0,0.5)`, and the `1c` logo button — `0 10px 30px rgba(0,0,0,0.4)`.
- `1b` dock and `1c` glass cards use `backdrop-filter: blur(18px)` / `blur(8px)`.

---

## Screens — direction `1a` (build this)

Five tabs, bottom bar, dark throughout. Tab bar: `border-top rgba(255,255,255,.10)`, fill `rgba(255,255,255,.03)`, padding `10px 4px 30px`, five equal flex items, each a 6px dot above a 10px label. Active = `#0951FA`, inactive = `#75808D`. Labels: **Today · Trip · Money · Booth · Team**.

### 1. Today (default)

*Purpose: know how close the show is and what is still on you.*

Top to bottom:
1. **Header row** — white SC mark (17px tall) + `TRADE SHOW TRAVEL` eyebrow; right: 34px circular button, `rgba(255,255,255,.06)`, with an unread dot (7px, `#FF4F00`, 1.5px canvas-colored ring).
2. **Countdown** — brand-bold `48` at 96px, baseline-aligned with a stack containing `DAYS OUT` (12px, letter-spacing 0.2em, `#0951FA`) and the **three-bar motif** (three 3px bars, widths 44/30/52px, opacity 0.5/0.28/0.14, middle bar offset 8px left — an abstraction of the logo's offset bars; it is decoration, never a substitute for the logo).
3. **Show line** — `NAC Conference & Expo` (19px/700) + `Oct 13–15 · Paris Las Vegas · Booth 312` (13px, `#93A0B4`).
4. **Trip readiness card** — title + `3 of 5 done` (`#f59e0b`); 5px progress track `rgba(255,255,255,.10)` with a 60% `#0951FA` fill; then five rows, each with a 20px leading indicator:
   - done → filled circle `rgba(16,185,129,.18)` + 1px `rgba(16,185,129,.5)` border, label 400/`#93A0B4`
   - open → 1.5px `#FF4F00` ring, label 600/white, trailing action link 13px `#0951FA`, row 48px with hairline top+bottom
   - Copy, in order: *Registered for NAC* ✓ · *Room at Paris Las Vegas* ✓ · **Add your flight into LAS** → `Add` · **Confirm check-in / check-out** → `Open` · *Expense capture ready* ✓
   - Readiness is derived, not stored: flight = the traveler's row in `event.travel` has `arrival === "TBD"`; hotel = `event.hotel.checkIn === "TBD"`.
5. **"First thing on the ground" card** — eyebrow + two items, each a 3px left rule (`#FF4F00` for required, `rgba(255,255,255,.16)` otherwise) + title/meta. Content from the first `schedule[0].items` entries.
6. **Team strip** — `rgba(9,81,250,.10)` fill, `rgba(9,81,250,.30)` border; three 28px overlapping initial avatars (−9px margin, 1.5px canvas ring, fills `#002B5E`/`#0951FA`/`#75808D`), `12 of us are traveling`, trailing `Roster` link → Team tab.

### 2. Trip

*Purpose: what happens each day, and what I'm wearing.*

1. Eyebrow `NAC 2026 · LAS VEGAS`, title **Your trip**.
2. **Two stat cards side by side, 10px gap.** Flight card is the alert state: `rgba(255,79,0,.10)` fill, `rgba(255,79,0,.32)` border, eyebrow `FLIGHT` in `#FF4F00`, value `Not added`, action `Look up flight` (`#0951FA`) → calls `netlify/functions/flight-lookup` with `{flightNumber, date, direction, eventAirport: event.airportCode}`. Hotel card is neutral surface: `Paris LV` / `Dates TBD`.
3. **Day segmented control** — track `rgba(255,255,255,.05)`, radius 12px, 4px padding; three equal segments, radius 9px, 10px vertical padding. Selected: white fill, `#05101f` text. Unselected: transparent, `#93A0B4`. Labels `Tue 13` `Wed 14` `Thu 15`.
4. **Dress-code card** — 3px `#0951FA` left rule, eyebrow `DRESS CODE`, then `schedule[day].dressCode` verbatim.
5. **Timeline** — per item: 74px right-aligned column (time 700/13px white, type 11px `#75808D`), a 1px `rgba(255,255,255,.12)` vertical rule with an 8px dot (`#FF4F00` for `type === "Team call"`, `#0951FA` for Expo, `rgba(255,255,255,.35)` otherwise), then title/location/notes. 20px gap between items.
6. Footer disclaimer, 11.5px `#75808D`, above a hairline: *All times subject to change. Marketing updates this hub as details are confirmed.*

All content comes from `getTradeShowById("nac-2026").schedule` — do not hardcode.

### 3. Money

*Purpose: capture spend as it happens, close out once.*

Mirror the logic in `src/components/EventExpenses.jsx` exactly; only the presentation changes.

1. Eyebrow `NAC 2026 · REIMBURSEMENT`.
2. **Total** — brand-bold `$1,284` 46px with `.55` at 18px `#75808D`, baseline-aligned. Below: `6 receipts` · `4 ready` (`#10b981`) · `2 need review` (`#f59e0b`), 12px/600.
3. **Primary CTA** — full-width 52px, `#0951FA`, radius 14px, camera icon + `Snap a receipt`; wired to the existing `<input type="file" accept="image/*" capture="environment">` → `createReceipt`.
4. Helper line, centered, 11.5px `#75808D`: *Shoot it now — it reads the merchant and total, and uploads when you get signal.* (This is the offline queue in `receiptQueue.js` — keep the promise honest.)
5. **Receipt rows** — 8px gap; each: 40×48px striped placeholder thumb (`repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 3px, transparent 3px 7px)` over `rgba(255,255,255,.05)`) → replace with the real receipt image via `getReceiptImage`; merchant 600/14px; `date · category · $total` 12px `#93A0B4`; trailing status pill. **Review** rows take a `rgba(245,158,11,.35)` border; **Ready** rows the standard surface border. Tapping a row opens the existing editor (merchant, date, category, subtotal/tax/tip/total, business purpose, notes).
6. **Finalize** — 52px, `rgba(245,158,11,.08)` fill, `rgba(245,158,11,.4)` border, `#f59e0b` label `Finalize trip report`; disabled until every receipt is confirmed, with the explanatory line below. Calls `downloadExpensePackage`.

### 4. Booth (map)

*Purpose: get from the elevators to booth 312 without asking anyone.*

1. Eyebrow `PARIS LAS VEGAS · CASINO LEVEL`, title **Elevators to Booth 312**, meta `4 min walk` (`#0951FA`) + `Paris Ballroom · Rivoli B` (`#75808D`).
2. **Full-bleed map** — `public/trade-shows/nac-2026-paris-map.png` on `#0a1626`, hairline top and bottom, with an absolutely positioned SVG overlay at `viewBox="0 0 1600 1886"`. All geometry already exists in `tradeShows.js → floorMap`: `routePath`, `start`, `destination`, `boothMarker`, `markerRadius: 18`, `routeWidth: 13`.
   - Shadow stroke `rgba(10,18,30,0.72)` 13px round cap, then `#FF4F00` 13px with `stroke-dasharray: 1 4` animated `stroke-dashoffset: 0 → -100`, 3.2s linear infinite (the existing `event-route-*` classes in `src/index.css` — reuse them, don't rewrite).
   - Booth outline: 6px `#FF4F00` rect at `boothMarker`.
   - Start: 18px `#0951FA` circle, 7px white stroke. Destination: 18px `#FF4F00` circle, 7px white stroke, with a pulsing duplicate beneath (`scale .8 → 1.5`, opacity `.25 → .75`, 1.8s ease-in-out infinite).
   - Honor `prefers-reduced-motion` — already handled in `index.css`.
3. **Legend** (two 10px dots + labels), then `floorMap.description` verbatim at 13.5px/1.6, then a 48px outline button `Open in Maps` → `event.venueMapUrl`.

### 5. Team

*Purpose: who else is here and how to reach them.*

Eyebrow `TRAVELING TEAM`, title **12 on the floor**, sub `Booth 312 · rally at 4:00 PM Tuesday`. Then one 56px row per person from `travelingTeam`: 38px initials avatar (fill cycles `#002B5E` / `#0951FA` / `#75808D`), name 600/14.5px, `Arrival TBD` 12px `#75808D` (from `event.travel`), and two 44px action buttons (call, message) on `rgba(255,255,255,.06)`. Hairline between rows. Footer note: *Phone and email are blank in the event record — the roster fills in as people confirm.* — because `teamContacts` is empty; hide the buttons per-person when there is no number.

---

## Alternate directions (reference only)

- **`1b` — no tabs, one prioritized feed.** Sticky 56px header (mark + `NAC 2026` + `48D OUT` in brand bold, `#0951FA`). A `Needs me / Everyone` segmented filter, then one stream of cards ranked by urgency: a blocking flight card (orange), a Marketing update card (`latestUpdates`), a three-row dress-code card, a map thumbnail card, a receipts card. Nav is a floating dock, absolutely positioned 40px from the bottom, inset 18px: `rgba(12,24,42,.86)` + 18px blur + `rgba(255,255,255,.14)` border, radius 20px, four items (Receipt / My flight / Booth / All), active item filled `#0951FA`. Worth stealing even if `1a` wins: the ranked "blocking your trip" card at the top.
- **`1c` — countdown as the interface.** Full-bleed `#002B5E`, the real white logo mark as a 520px watermark at 13% opacity bleeding off the right edge, 150px brand-bold countdown, horizontally swipeable 196px glass lane cards, and a single 62px white circular button holding the blue logo mark that opens a bottom sheet with the five destinations. No tab bar.

## Interactions & behavior

| Trigger | Result |
| --- | --- |
| Tab tap | Switch screen; active tab dot + label go `#0951FA`. Route change, state preserved per tab. |
| Day segment tap | Swap dress code + timeline for `schedule[n]`. |
| `Add` / `Look up flight` | Flight-number + date form → `flight-lookup` function → confirm the matched flight, write to the traveler's `travel` row. |
| `Snap a receipt` | Native camera capture → `createReceipt` → optimistic row appended with `Review` state. Offline → queued row plus the "waiting to upload" banner from `EventExpenses.jsx`; flushes on `window online`. |
| Receipt row tap | Expand/push the receipt editor; `Confirm receipt` flips the pill to `Ready`. |
| `Finalize trip report` | Disabled until all confirmed; then `downloadExpensePackage`. |
| Roster / call / message | Team tab; `tel:` and `sms:` links, hidden when the contact is blank. |
| `1c` logo button | Toggles the nav sheet with a scrim (`rgba(2,10,22,.55)` + 3px blur). |

Transitions: route/tab changes are instant (no cross-fade). The only continuous motion is the map route dash flow and the destination pulse. Reuse `animate-slide-in` from `index.css` for cards appearing after data load.

## State

```
tab           'today' | 'trip' | 'money' | 'booth' | 'team'   (route-backed)
day           0 | 1 | 2                                        (Trip tab)
event         getTradeShowById('nac-2026')                     (or the next upcoming show)
me            Netlify Identity user → matched into event.travel
receipts      listReceipts(event.id, user) + queued            (existing hook)
pendingCount  pendingReceiptCount(event.id)
readiness     derived: [registered, hotel, flight, hotelDates, expensesReady]
sheetOpen     boolean                                          (1c only)
```

Countdown = `differenceInCalendarDays(parseISO(schedule[0].date), today)` in the event's `timezone` (`America/Los_Angeles`). The `48` in the mock is Aug 26 → Oct 13; never hardcode it.

## Assets

All already in the repo — nothing new to add:

| Asset | Location |
| --- | --- |
| Brand fonts (bold + regular, woff2 + otf) | `public/fonts/SWITCHCOMMERCE*` — declared in `src/fonts.css` |
| SC logo mark, white | supplied by the brand set; bundled here as `assets/sc-mark-white.png` |
| SC logo mark, blue | bundled here as `assets/sc-mark-blue.png` |
| SC horizontal wordmark, white | bundled here as `assets/sc-wordmark-white.png` |
| Paris Las Vegas floor map | `public/trade-shows/nac-2026-paris-map.png` |

Icons: use `@heroicons/react/24/outline` (`CameraIcon`, `PhoneIcon`, `ChatBubbleLeftIcon`, `MapPinIcon`, `TicketIcon`, `BellIcon`). The prototype draws plain geometric stand-ins — replace them with Heroicons, do not port the placeholder shapes. The three-bar motif and the logo watermark are the only intentional custom graphics.

## Files in this bundle

| File | What it is |
| --- | --- |
| `Trade Show Travel App.dc.html` | The design prototype — open it in a browser to click through `1a`'s five screens, `1b`, and `1c`. Reference only. |
| `ios-frame.jsx` | Mock device bezel used by the prototype. Not part of the deliverable. |
| `support.js` | Prototype runtime. Not part of the deliverable. |
| `assets/` | Logo marks, brand fonts, floor map used by the prototype. |
| `CLAUDE_CODE_PROMPT.md` | Paste-ready prompt for Claude Code. |
| `github.md` | Records which repo files each screen was designed from. |

## Definition of done

- Five screens reachable from the tab bar, rendering real `tradeShows.js` data for `nac-2026`.
- No hardcoded countdown, schedule, dress code, roster, or route geometry.
- Receipt capture, offline queue, confirm, and finalize all still work through the existing `expenses.js` API.
- Every tap target ≥44px; text ≥12px; `prefers-reduced-motion` respected.
- Works installed as a PWA on iOS Safari (existing manifest/service worker), including the map screen offline.
