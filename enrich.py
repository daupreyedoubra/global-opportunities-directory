#!/usr/bin/env python3
"""Merge enrichment records into opportunities_base.json → data.json.

Usage: python3 enrich.py <<'JSON'
[{"id": 15, "deadline": "2026-04-20", ...}]
JSON
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, 'opportunities_base.json')
OUT = os.path.join(HERE, 'enrichment.json')

records = json.load(sys.stdin)
store = json.load(open(OUT)) if os.path.exists(OUT) else {}
for r in records:
    rid = str(r.pop('id'))
    store.setdefault(rid, {}).update(r)
json.dump(store, open(OUT, 'w'), indent=1, ensure_ascii=False)

base = json.load(open(BASE))
done = sum(1 for o in base if str(o['id']) in store)
print(f"enrichment records: {len(store)}/{len(base)}")
