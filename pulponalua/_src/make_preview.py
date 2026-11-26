#!/usr/bin/env python3
"""Genera una versión de una sola pieza (assets incrustados) para la vista previa en Claude."""
import re, base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
mt = {'.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.webp':'image/webp'}
uri = lambda p: f"data:{mt[pathlib.Path(p).suffix]};base64," + base64.b64encode((root/p).read_bytes()).decode()
html=(root/'index.html').read_text(encoding='utf-8'); css=(root/'css/style.css').read_text(encoding='utf-8')
js=(root/'js/main.js').read_text(encoding='utf-8'); cfg=(root/'js/config.js').read_text(encoding='utf-8')
css=re.sub(r'url\(\.\./assets/([^)]+)\)',lambda m:f'url({uri("assets/"+m.group(1))})',css)
css=css.replace('--font:"code-saver",','--font:"code-saver","JetBrains Mono",')+"\n:root{color-scheme:light}\n"
js=js.replace("history.replaceState(null, '', '#/trabajos')","history.replaceState(null, '', '#trabajos')").replace("history.pushState(null, '', '#/' + slug)","history.pushState(null, '', '#' + slug)").replace("location.hash = '#/' + slug","location.hash = '#' + slug")
cfg=cfg.replace('window.PORTFOLIO = {','window.PORTFOLIO = {\n  demo: true,')   # el envío es simulado en la vista previa
html=html.replace('<link rel="stylesheet" href="https://use.typekit.net/uzv0ohi.css">','<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap">')
html=html.replace('<link rel="stylesheet" href="css/style.css">',f'<style>{css}</style>')
html=html.replace('width=device-width, initial-scale=1"','width=device-width, initial-scale=1, viewport-fit=cover"')
html=re.sub(r'<link rel="icon"[^>]*>','',html)
for r in ['trabajos','sobre-mi','contacto','dobraondas','gally','fake','ella-es-mayor','cuarto-lugar','huevo']: html=html.replace(f'href="#/{r}"',f'href="#{r}"')
html=html.replace('href="#/"','href="#"')
html=re.sub(r'(src|href)="assets/([^"]+)"',lambda m:f'{m.group(1)}="{uri("assets/"+m.group(2))}"',html)
html=html.replace('<script src="js/config.js"></script>',f'<script>{cfg}</script>').replace('<script src="js/main.js"></script>',f'<script>{js}</script>')
import sys
out=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/outputs/portfolio-pulponalua.html'); out.write_text(html,encoding='utf-8'); print(round(out.stat().st_size/1e6,2),'MB')
