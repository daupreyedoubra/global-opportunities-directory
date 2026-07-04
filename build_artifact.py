#!/usr/bin/env python3
"""Inline styles.css, app.js and data.json into a single self-contained HTML file."""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "dist", "artifact.html")

html = open(os.path.join(HERE, "index.html")).read()
css = open(os.path.join(HERE, "styles.css")).read()
js = open(os.path.join(HERE, "app.js")).read()
data = open(os.path.join(HERE, "data.json")).read()

html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
html = html.replace(
    '<script src="app.js"></script>',
    f"<script>window.__DATA__ = {data};</script>\n<script>\n{js}\n</script>",
)
os.makedirs(os.path.dirname(out_path), exist_ok=True)
open(out_path, "w").write(html)
print(f"wrote {out_path} ({len(html)//1024} KB)")
