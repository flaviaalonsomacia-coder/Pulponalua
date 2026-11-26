#!/usr/bin/env python3
"""Añade guiones opcionales (&shy;) entre las sílabas de los textos justificados de
index.html, para que el navegador pueda partir palabras al final de línea y los
espacios no se abran (sin ríos). Se puede ejecutar varias veces: primero quita los
que hubiera. Uso: python3 _src/guiones.py"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
f = root / 'index.html'
SHY = '&shy;'
NO_PARTIR = {'pulponalua', 'dobraondas', 'ilion', 'u-tad', 'gally', 'fake', 'flavia'}
V = set('aeiouáéíóúü'); FUERTES = set('aeoáéíóú')
GRUPOS = {'pl','bl','fl','cl','gl','kl','pr','br','fr','cr','gr','kr','tr','dr','ch','ll','rr'}

def unidades(w):
    """Divide la palabra en letras, tratando qu/gu(e,i), ch, ll, rr como una consonante."""
    u, i, lw = [], 0, w.lower()
    while i < len(w):
        dos = lw[i:i+2]
        if dos in ('qu',) or (dos in ('gu',) and lw[i+2:i+3] in ('e','i','é','í')):
            u.append(('C', w[i:i+2])); i += 2; continue
        if dos in ('ch','ll','rr'):
            u.append(('C', w[i:i+2])); i += 2; continue
        c = lw[i]
        if c == 'y':
            sig = lw[i+1:i+2]
            u.append(('C' if sig in V else 'V', w[i]))
        else:
            u.append(('V' if c in V else 'C', w[i]))
        i += 1
    return u

def silabas(w):
    u = unidades(w)
    cortes = []  # índices de unidad antes de los que se corta
    n = len(u)
    i = 0
    # localizar núcleos vocálicos y consonantes entre ellos
    vpos = [k for k, (t, _) in enumerate(u) if t == 'V']
    if len(vpos) < 2: return [w]
    k = 0
    while k < len(vpos) - 1:
        a, b = vpos[k], vpos[k+1]
        if b == a + 1:  # vocales seguidas: hiato o diptongo
            x, y = u[a][1].lower(), u[b][1].lower()
            x = 'i' if x == 'y' else x; y = 'i' if y == 'y' else y
            # las vocales seguidas no se separan nunca a final de línea (ni en hiato,
            # como recomienda la RAE): "rea-li-dad", "idea-ción"
            k += 1; continue
        cons = [u[j][1].lower() for j in range(a+1, b)]
        m = len(cons)
        if m == 1: cortes.append(a+1)
        elif m == 2: cortes.append(a+1 if ''.join(cons) in GRUPOS else a+2)
        elif m == 3: cortes.append(a+2 if ''.join(cons[1:]) in GRUPOS else a+3)
        else: cortes.append(a+3 if ''.join(cons[2:]) in GRUPOS else a+3)
        k += 1
    partes, ini = [], 0
    txt = [s for _, s in u]
    for c in cortes:
        partes.append(''.join(txt[ini:c])); ini = c
    partes.append(''.join(txt[ini:]))
    return [p for p in partes if p]

def partir(w):
    if len(w) < 5 or w.lower() in NO_PARTIR or not w.isalpha() or (w.isupper() and len(w) > 1):
        return w
    s = silabas(w)
    # nunca dejar menos de 2 letras a cada lado del guion
    while len(s) > 1 and len(s[0]) < 2: s[1] = s[0] + s[1]; s.pop(0)
    while len(s) > 1 and len(s[-1]) < 2: s[-2] += s[-1]; s.pop()
    # tampoco partir dejando una vocal suelta tipo "a-" en una sílaba de 1 letra en medio
    return SHY.join(s)

PAL = re.compile(r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:-[A-Za-z]+)?')
def procesar_texto(t):
    return PAL.sub(lambda m: m.group(0) if '-' in m.group(0) else partir(m.group(0)), t)
def procesar_html(h):
    trozos = re.split(r'(<[^>]+>|&[a-z]+;|&#\d+;)', h)
    return ''.join(x if (x.startswith('<') or x.startswith('&')) else procesar_texto(x) for x in trozos)

html = f.read_text(encoding='utf-8').replace(SHY, '')
SEL = [r'<p class="card__aviso"[^>]*>', r'<p class="contacto__sub"[^>]*>']
def sub_p(m): return m.group(1) + procesar_html(m.group(2)) + '</p>'
for s in SEL:
    html = re.sub('(' + s + ')(.*?)</p>', sub_p, html, flags=re.S)
# párrafos sin clase dentro de bloques justificados
def bloque(m):
    return re.sub(r'(<p(?: style="[^"]*")?>)(.*?)</p>', sub_p, m.group(0), flags=re.S)
for b in [r'<div class="intro__text">.*?</div>', r'<div class="sobre__texto">.*?</div>',
          r'<div class="proyecto__texto">.*?</div>', r'<div class="proyecto__nota"[^>]*>.*?</div>']:
    html = re.sub(b, bloque, html, flags=re.S)
f.write_text(html, encoding='utf-8')
print('guiones:', html.count(SHY))
