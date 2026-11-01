# 喝大水：加减、记录反馈与使用手册

final result: passed

## Visual target and approved changes
- Existing visual truth: outputs/white-card-light.png (709 × 343 pixels). Preserve white round surface, charcoal text, muted water, seven-cup graph and no headings/separators in the embedded card.
- User overrides the earlier mock: replace inputs/presets with click-only +/-; no second confirmation; animate successful records and crossing today's goal; build a manual website.
- Final rendered card: outputs/stepper-card.png (393 × 240 crop; app 386 CSS px wide). Other browser-rendered evidence: outputs/guide-goal.png, outputs/hydration-guide.png, outputs/guide-mobile.png, outputs/stepper-dark-mobile.png.
- Full screenshot and source image were opened in the same comparison call. Source desktop versus final narrow-screen image is an intentional responsive comparison, not a pixel-identical mock claim; reference data is illustrative while the card fixture uses 800 ml. No density resampling or image-generated UI substituted for browser output.

## Findings and comparison
- Typography: retain system/PingFang sans-serif, subdued labels, emphasized amount; no clipping or truncation in the tested card widths.
- Spacing: compact summary and recorder fit a row at desktop widths; recorder wraps under summary at small widths. Existing seven-column chart remains readable. No horizontal overflow at 375px card, 390px manual, or 1004px desktop manual inner card.
- Colors/tokens: white round surface and muted teal water preserved. Simulated dark host resolves card background to rgb(38,38,36); text and controls follow host tokens.
- Assets: reuse existing code-native Cup SVG exactly; +/- and check icons come from the existing Lucide package. No new decorative assets required.
- Copy: explicit '喝了 N ml' directly submits, +/- changes selection only. Manual clearly labels demo data and simulated voice.
- Earlier draft showed an old undo notice alongside a newer receipt. Fixed by clearing the notice on a new feedback event; final browser states show the current receipt.
- Focused check: recorder input count is zero; capacity/submit/undo labels and current total were read from browser DOM. Water transition transform was captured mid-animation (translateY 81.3117), plus goal-halo and goal-celebrating state.

## Behavior checked
- UI: decrease 250 to200 preserves total800; click records200 ->1000; undo ->800.
- Simulated incoming tool result:150 ->950 without confirmation, water motion and receipt appear.
- Goal demo:800+1200 ->2000 with goal animation; backend tests cover already-above-goal and historical additions without today's celebration.
- Save failure preserves250 and total; retry reuses identical request UUID and increments only once. Buttons are disabled while pending.
- Replaying the same notification after motion ended does not replay motion or add water. Session marker retains at most100 event IDs, no drinking data.
- Browser console errors checked for the manual: none.
- Typecheck, five domain tests, local built-Worker integration tests passed, including isolation, idempotency, goal transition and MCP add-resource binding.

## Remaining verification boundary
- Host voice transcription and the next real cloud write were not exercised: all new animation/save tests used local identities or isolated example data. No actual user drink was fabricated.
- Desktop viewport override was not reflected by this browser provider. Narrow-page verification instead used a real390px iframe viewport; its document and card widths were measured directly.
- Reduced-motion behavior is implemented through CSS and retains textual receipts; OS preference switching was not exercised.

## Follow-up: full history and statistics

final result: passed

- Existing compact card remains visually and functionally intact. `/` and expanded MCP mode now share `DetailsApp`; `/guide` remains the separate manual. Resource identities and host mode notifications control compact versus complete view.
- New full-view evidence: `outputs/details-panel.png` (420 × 780 crop, local sample identity); no horizontal overflow (420 CSS px client and scroll widths). Initial empty standalone view was also inspected; zero recorded-day average now displays a dash.
- Full view uses the same system/PingFang typography, charcoal and muted teal tokens, white/gray surfaces, restrained spacing and library icons. Desktop uses four statistic columns, narrow panels two. History records use date groups and row separators rather than per-row cards.
- Browser and real local built Worker: 62 sample records across62 dates, including records61 days old. Loading history appended50 ->62 rows, oldest2026-09-01. Changing1110 ->1150 updated total61.49 ->61.53L. Goal2000 ->1000 changed achievement8 ->19days; restoring2000 returned8 without changing quantity.
- 7-day filter showed5.7L,7recorded days,1achieved day,814ml recorded-day average; backend tests verify empty ranges, same-time pagination without skipped/duplicate IDs, older updates/deletes, invalid cursor/range and cross-user isolation.
- A resize issue was found and corrected: fullscreen no longer publishes document height, and inline measures root content and resets the last height when changing modes. Fullscreen fixture holds800px; collapse restores247px and contains one compact view and zero full-view roots.
- Simulated dark full panel used backgroundrgb(32,32,30), textrgb(231,231,223) and had no horizontal overflow.
- One browser automation MutationObserver error appeared while controlling a long nested iframe; the shipped UI bundle contains no MutationObserver. Primary app interactions completed via native accessibility actions. No app failure was observed.
- Verification boundaries: mode notifications and side-panel width were simulated locally. The current Codex native expansion and external-site connection remain to be checked after publication when reachable. No real cloud user entries were added, edited or deleted during tests.

## Follow-up: cups follow the selected time range

final result: passed

- Full-view calendar now follows statistics bounds:7d=7cups,30d=30cups,all=first-record date through today. Empty all-time views fall back to7unknown days. Missing dates keep a gray cup/dash; totals above goal stay actual while water caps atfull.
- Browser/local fixture verified: compact7,full all62,full30d30,back to7d7. Narrow420px view measured420px client and scroll width; all30 cups fit490px content without internal clipping. Longer62-day calendar has an internal scrollbar and initially shows recent dates.
- Clicking2026-10-04 correctly showed790ml outside the seven-day snapshot, then returned to today. Switching ranges resets a selection that falls outside the new range.
- Screenshot: outputs/calendar-30-days.png (420×780, local example data). Existing system font, charcoal/teal tokens and cup assets retained.
- Nine domain tests and TypeScript passed. No production drinking records changed. Site access was observedpublic; user explicitly instructedkeepingpublic during this update. Personal APIs still require logged-in identity and isolate byuser.

## Follow-up: public product introduction and usage guide

- `/guide` now presents scenarios, a live sample, locations of each interface, chat examples, cup semantics, editing/backfill and FAQs. `/` remains the logged-in personal workspace. Existing `#say` links are preserved.
- The demo switches between actual compact and full components with independent in-memory sample records. Browser verification: simulated150ml updated800 to950 and appeared in full history/statistics; changing the sample goal2000 to1800 recalculated achievement without changing the17.05L total. Sample timestamps are normalized to ISO UTC for stable chronological sorting.
- Desktop layout and390px iframe viewport were visually inspected. The narrow document measured390px client/scroll widths with no horizontal overflow; scenario/page cards stack and demo controls wrap. Narrow nested-iframe clicks were unavailable in the browser controller; full demo interactions were verified in the desktop tab.
- Guide example operations do not call real hydration APIs. Personal cloud records were not changed. Nine domain tests and TypeScript passed.
