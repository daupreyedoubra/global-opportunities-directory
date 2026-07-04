# Design

Visual system for The Opportunities Directory. Register: product (speed tool) with one
editorial moment (the masthead). Color strategy: **Restrained** — tinted neutrals, one
crimson primary carrying urgency, accent and semantic colors on status only.

## Mood

"Newsroom deadline desk — red pen on white paper, telex urgency, calm authority."
Light surface only (users arrive mid-task in daylight from a feed; the physical scene
is a desk, a phone, a decision). Brand seed: oklch(0.527 0.202 22.7) warm crimson.

## Color (OKLCH only)

```css
:root {
  --bg:       oklch(1 0 0);              /* pure white — Stripe/Notion discipline */
  --surface:  oklch(0.965 0.004 25);     /* panels, filter bar, row hover        */
  --surface-2:oklch(0.93 0.006 25);      /* second neutral: chips, wells         */
  --ink:      oklch(0.22 0.015 25);      /* body text, ≥7:1 on bg                */
  --muted:    oklch(0.49 0.012 25);      /* secondary text, ≥4.5:1 on bg         */
  --line:     oklch(0.88 0.005 25);      /* hairlines                            */
  --primary:  oklch(0.527 0.202 22.7);   /* crimson: deadlines, primary actions  */
  --primary-ink: oklch(0.40 0.17 22.7);  /* crimson dark enough for text on white */
  --accent:   oklch(0.38 0.10 165);      /* deep green: OPEN status, success     */
  /* semantic status */
  --st-open:      var(--accent);
  --st-closing:   var(--primary);
  --st-closed:    var(--muted);
  --st-rolling:   oklch(0.42 0.08 250);  /* slate blue */
  --st-caution:   oklch(0.55 0.11 75);   /* amber-brown for unverified */
}
```

White text on any saturated fill (crimson/green badges); dark text only on pale fills.
Status is always icon/text + color, never color alone.

## Typography

- **UI family (everything):** system-ui stack — `ui-sans-serif, system-ui, -apple-system,
  "Segoe UI", Roboto, Inter, sans-serif`. Fixed rem scale, ratio ≈1.2:
  0.75 / 0.8125 / 0.875 (base) / 1.05 / 1.25 / 1.5 / 2.2rem.
- **Masthead only:** transitional serif stack — `Georgia, "Iowan Old Style", "Times New
  Roman", serif` — the single editorial moment. Never used in labels, buttons, or data.
- Tabular numerals (`font-variant-numeric: tabular-nums`) on all dates and counts.
- `text-wrap: balance` on headings.

## Layout

- Single page. Max content width 1080px; list rows run full width of the container.
- Masthead → sticky filter bar → result summary line → list rows → footer credit.
- Rows, not cards: full-width hairline-separated rows with a fixed-width deadline
  column (the scan spine), main column (name, eligibility, benefit), status column.
- Responsive is structural: on <720px the deadline column folds into a row header,
  filter bar wraps, columns stack. No fluid type.
- z-index scale: sticky-bar 10 < toast 20. Nothing higher exists.

## Components

- **Status badge:** pill, saturated fill + white text (open/closing) or outlined
  neutral (closed/rolling/unverified). All states designed.
- **Filter chips:** toggle buttons with pressed state (`aria-pressed`), surface-2 fill,
  ink text; selected = ink fill + white text (not accent — accent is status-only).
- **Search:** standard input, visible focus ring (2px primary offset).
- **Row expansion:** native `<details>`-style disclosure for full eligibility +
  verification note. No modals.
- **Empty state:** teaches — "Nothing matches. Try clearing the status filter or
  widening region." with one-click reset.

## Motion

150–200ms ease-out state transitions only (row expand, chip toggle, list re-render
fade). No page-load choreography. `prefers-reduced-motion: reduce` → instant.
