# The Opportunities Directory 2026/27

**Sorted by deadline. Filtered by who actually qualifies.**

A verified, deadline-first frontend for the widely shared *“2026/2027 Global and
Regional Opportunities Directory”* PDF compiled by
[Abdulsamad (@richtosho)](https://x.com/richtosho). The PDF lists 142 grants,
accelerators, fellowships, internships and competitions — but no deadlines and no
eligibility detail. As of **4 July 2026**, 83 of the 142 (58%) had already closed.

This site adds what the PDF couldn’t hold:

- **Verified deadlines** for every entry we could confirm, with live
  open / closing-soon / closed / rolling status
- **Concrete eligibility criteria** (country, age, gender focus, business stage) so
  nobody wastes 2 hours discovering they were never eligible
- **Honest flags** — entries we couldn’t verify are labeled *unverified*, not dressed up
- **Instant filtering** by status, region, opportunity type, and profile
  (woman founder / under 35 / student / in Nigeria), plus full-text search

## Structure

| File | Purpose |
|---|---|
| `index.html` / `styles.css` / `app.js` | The site — zero dependencies, static, host anywhere |
| `data.json` | All 142 opportunities with enrichment (deadlines, eligibility, status, notes) |
| `enrichment.json` / `opportunities_base.json` / `enrich.py` | Raw extraction + enrichment pipeline artifacts |
| `build_artifact.py` | Inlines everything into one self-contained HTML file (`dist/artifact.html`) |
| `PRODUCT.md` / `DESIGN.md` | Product and design system context (Impeccable) |

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Updating the data

`data.json` is the single source the frontend reads. Each entry carries a
`status` and `daysLeft` computed against the verification date. To refresh:
re-verify deadlines, update `enrichment.json`, and regenerate — or edit
`data.json` directly for one-off corrections.

## Credits

Original list compiled by **Abdulsamad [@richtosho](https://x.com/richtosho)** and
shared freely (“NOT FOR SALE”). Deadline and eligibility verification, and this
frontend: July 2026. Always confirm details on the official program page before
applying — deadlines change and cohorts reopen.
