#!/usr/bin/env python3
"""Genera la versión para publicar como artefacto de Claude: index.html con CSS/JS dentro
y la carpeta assets/ con solo los archivos que se usan."""
import re, pathlib, shutil, sys
root = pathlib.Path(__file__).resolve().parent.parent
dst = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/pub')
html=(root/'index.html').read_text(encoding='utf-8'); css=(root/'css/style.css').read_text(encoding='utf-8')
js=(root/'js/main.js').read_text(encoding='utf-8'); cfg=(root/'js/config.js').read_text(encoding='utf-8')
css=css.replace('url(../assets/','url(assets/')
css=css.replace('--font:"code-saver",','--font:"code-saver","JetBrains Mono",')+"\n:root{color-scheme:light}\n"
js=js.replace("history.replaceState(null, '', '#/trabajos')","history.replaceState(null, '', '#trabajos')").replace("history.pushState(null, '', '#/' + slug)","history.pushState(null, '', '#' + slug)").replace("location.hash = '#/' + slug","location.hash = '#' + slug")
cfg=cfg.replace('window.PORTFOLIO = {','window.PORTFOLIO = {\n  demo: true,')
html=html.replace('<link rel="stylesheet" href="https://use.typekit.net/uzv0ohi.css">','<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap">')
html=html.replace('<link rel="stylesheet" href="css/style.css">',f'<style>{css}</style>')
html=html.replace('width=device-width, initial-scale=1"','width=device-width, initial-scale=1, viewport-fit=cover"')
html=re.sub(r'<link rel="icon"[^>]*>','',html)
html=re.sub(r'href="#/([a-z-]+)"',r'href="#\1"',html)
html=html.replace('href="#/"','href="#"')
html=html.replace('<script src="js/config.js"></script>',f'<script>{cfg}</script>').replace('<script src="js/main.js"></script>',f'<script>{js}</script>')
if dst.exists(): shutil.rmtree(dst)
(dst/'assets').mkdir(parents=True)
usados=set(re.findall(r'assets/([\w.\-]+)',html))
for f in sorted(usados): shutil.copy(root/'assets'/f, dst/'assets'/f)
(dst/'index.html').write_text(html,encoding='utf-8')
print(len(usados),'assets;', round((dst/'index.html').stat().st_size/1e3),'KB html')
