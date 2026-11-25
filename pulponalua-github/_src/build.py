#!/usr/bin/env python3
"""Convierte las medidas 'Nu' del diseño (1920 px de ancho) a calc(var(--u) * N)."""
import re, pathlib
here = pathlib.Path(__file__).parent
src = (here / "style.src.css").read_text(encoding="utf-8")
pat = re.compile(r'(?<![\w.#\-])(-?\d+(?:\.\d+)?)u(?![\w\-])')
out = pat.sub(lambda m: f"calc(var(--u) * {m.group(1)})", src)
dst = here.parent / "css" / "style.css"
dst.write_text(out, encoding="utf-8")
print("css/style.css generado:", len(out), "bytes")
