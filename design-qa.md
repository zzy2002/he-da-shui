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
