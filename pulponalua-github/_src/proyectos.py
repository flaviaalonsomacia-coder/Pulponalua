#!/usr/bin/env python3
"""Genera las páginas de proyecto de index.html a partir de los datos de abajo.
Edita los textos/imágenes aquí y ejecuta: python3 _src/proyectos.py"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
ARROW='<svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true"><path d="M2 12H37M27 2l10 10-10 10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
# medidas de la galería en puntos del diseño (ancho total 1781)
P=[
 dict(slug='dobraondas',titulo='dobraondas',rol='DIRECCIÓN DE ARTE',ano='2024',
  pills=[['DISEÑO DE MARCA','PACKAGING'],['ILUSTRACIÓN','MOTION GRAPHICS']],
  texto=[['Dobraondas es una marca que busca concienciar sobre el daño','que causa el petróleo en el mar, especialmente en las','costas españolas.'],
         ['La iniciativa pretende involuclar al espectador de manera','activa, haciendo que este se divierta con el producto a la','vez que se empapa de la problemática.'],
         ['Este proyecto fue seleccionado para enseñarlo y testearlo','en Madrid es Ciencia. Fue muy bien acogido por niños,','padres e incluso profesores, que encontraron el taller como','algo divertido y didáctico al mismo tiempo.']],
  galeria=[dict(img='dobraondas-galeria-1.jpg',w=2672,h=1125,alt='Figura de papel azul plegada sobre fondo rojo con manchas negras'),
           dict(img='dobraondas-galeria-2.jpg',w=2672,h=2692,alt='Logotipo de Dobraondas, figuras de papel plegado e iconos de la marca',alto=1794,
                notas=[dict(l=1091.5,t=630,parrafos=[['En la experiencia que incorporaba esta marca, se le','daba a los niños una caja con el papel para hacer','la figura, las instrucciones en forma de barquito y','algunos recortes de “chapapote”.'],['Una vez acababan de hacer la figura, se les guiába','a escanear un código QR que mostraba una animación','de la figura realizada en RA.']])]),
           dict(video='dobraondas-video.mp4',alto=1001.5,titulo='Vídeo de Dobraondas')],
  equipo=['Flavia Alonso','Marina Mesa','Rocío Andrade','Gloria Sarmiento']),
 dict(slug='gally',titulo='gally',rol='DIRECCIÓN DE ARTE',ano='2026',premio=True,
  pills=[['DISEÑO DE MARCA','ICONOGRAFÍA'],['ILUSTRACIÓN','MOTION GRAPHICS','DISEÑO DE PERSONAJES']],
  texto=[['Rediseño del personaje Gally, su marca asociada y','el Libro Blanco de Accesibilidad para','Desarrolladores para la ONCE.'],
         ['Esta primera propuesta ganó el concunso propuesto','por la ONCE, que nos permitió posteriormente hacer','un cortometraje explicativo sobre qué es la','iniciativa Gally.'],
         ['Habrá avances del proyecto muy pronto...']],
  galeria=[dict(img='gally-galeria-1.jpg',w=2672,h=3129,alt='Personaje Gally y personajes secundarios, libro blanco, cartel e iconografía del proyecto')],
  equipo=['Flavia Alonso','Sofía Carbonell']),
 dict(slug='fake',titulo='fake',rol='DIRECCIÓN DE ARTE',ano='2025',
  pills=[['DISEÑO DE MARCA','PACKAGING'],['ILUSTRACIÓN','FOTOGRAFÍA']],
  texto=[['Fake es un perfume que no tiene nada en su interior, es','frágil, de papel, de aire.'],
         ['La campaña señala directamente a la industria de los','cosméticos y juega conscientemente con las percepciones','del espectador. A través de la ausencia, cuestiona las','promesas de lujo y perfección de la publicidad,','evidenciando lo superficial y lo construido de ciertos','discursos de marca.']],
  galeria=[dict(img='fake-galeria-1.jpg',w=2672,h=1138,alt='Bolsa de papel arrugada con el logotipo FAKE'),
           dict(img='fake-galeria-2.jpg',w=2672,h=4463,alt='Revistas, cartel, packaging, bolsa y catálogo de la campaña FAKE')],
  equipo=None),
 dict(slug='ella-es-mayor',titulo='ella es mayor',rol='FOTOGRAFÍA',ano='2024',
  pills=[['MAQUETACIÓN','FOTOGRAFÍA']],
  texto=[['El proyecto “Ella es mayor”, es una colección de','fotos donde retrato la relación que tengo con mi','abuela a través de nuestras similitudes y','diferencias a causa de la educación, la edad y los','valores.']],
  galeria=[dict(img='ella-galeria-1.jpg',w=2672,h=1673,alt='Libro “Ella es mayor” con fotografía de unas manos'),
           dict(img='ella-galeria-2.jpg',w=2672,h=2210,alt='Páginas interiores del libro “Ella es mayor”',alto=1473.5,
                notas=[dict(l=1133.2,t=377.7,parrafos=[['“Antes de nada, pongamos nombre a','mi abuela, ella es Tita, Matilde,','Matildita, Mamá, Abuela o','Bisabuela. En todos estos casos','existe una brecha generacional,','pero yo soy el ser consciente con','la mayor brecha respecto a ella.”']]),
                       dict(l=153,t=1052.3,parrafos=[['“Me di cuenta de que ya no estaba cerca','del mar ni de nada conocido, era algo','emocionante, pero después de un tiempo','empezó a ser algo a lo que añorar, un','conflicto entre lo nuevo y lo viejo. Sin','embargo, en vez de seguir dándole','vueltas a un sentimiento que sabía que','iba a perdurar, preferí verlo desde otro','punto de vista, desde el de mi abuela.”']])]),
           dict(carrusel=[('ella-carrusel-1.jpg','Libro abierto: manos de la abuela cosiendo y manos jóvenes con un ratón. “Una mano vieja”'),
                          ('ella-carrusel-2.jpg','Libro abierto: flores en un jarrón de cristal y flores de piezas de construcción. “Algo que no se huele”'),
                          ('ella-carrusel-3.jpg','Libro abierto: tejados de día y una calle de noche. “Las vistas del salón”'),
                          ('ella-carrusel-4.jpg','Libro abierto: dos mesillas de noche. “Retrato de buenas noches”'),
                          ('ella-carrusel-5.jpg','Libro abierto: retrato de la abuela y retrato de la nieta. “Ella es mayor”'),
                          ('ella-carrusel-6.jpg','Contraportada roja del libro “Ella es mayor”')],
                alto=1364.5,separacion=108.5,titulo='Fotos del libro “Ella es mayor”')],
  equipo=None),
 dict(slug='cuarto-lugar',titulo='cuarto lugar',rol='DIRECCIÓN DE ARTE',ano='2025',
  pills=[['DISEÑO DE MARCA','MOTION GRAPHICS'],['IA GENERATIVA']],
  texto=[['Branding e identidad gráfica de un evento que explora la','desconexión emocional y social provocada por la hiperconectividad','digital. Es una experiencia inmersiva que se desarrolla a través de','un recorrido que combina arte instalativo con realidad aumentada,','donde el espectador atraviesa distintas salas y, en cada una, puede','utilizar su móvil para mirar a su alrededor y descubrir que no está','solo.'],
         ['La idea es mostrar cómo, a veces, pasamos tanto tiempo frente a las','pantallas que nos olvidamos de sentir y de mirar el mundo real. Al','final del recorrido, las personas deben decidir si quieren volver','al mundo real o quedarse dentro de ese mundo digital.']],
  galeria=[dict(img='cuarto-galeria-1.jpg',w=2672,h=1525,alt='Puertas de metro con el texto “Donde los espacios están vacíos y los móviles llenos”'),
           dict(img='cuarto-galeria-2.jpg',w=2672,h=6171,alt='Identidad de Cuarto Lugar: logotipo, señalética, carteles y lona',alto=4114,
                cajas=[dict(l=1037.5,t=0.5,w=743.5,h=1343,video='cuarto-video-1.mp4',titulo='Vídeo del evento Cuarto Lugar'),
                       dict(l=0,t=2339.5,w=1037.5,h=1021,video='cuarto-video-2.mp4',titulo='Vídeo de Cuarto Lugar')])],
  equipo=['Flavia Alonso','Alejandro Escartín']),
 dict(slug='huevo',titulo='huevo',rol='MOTION GRAPHICS',ano='2025',
  pills=[['DISEÑO DE MARCA','DISEÑO 3D'],['ILUSTRACIÓN','MOTION GRAPHICS']],
  texto=[['Ideación de una cortinilla inspirándome en el Canal','Cocina y rediseño o ajuste de logo y colores para la','mejora de la pieza.']],
  galeria=[dict(img='huevo-galeria-1.jpg',w=2672,h=1423,alt='Huevo translúcido con yema sobre fondo negro'),
           dict(img='huevo-galeria-2.jpg',w=2672,h=1958,alt='Logotipo de Canal Cocina y valla publicitaria'),
           dict(video='huevo-video.mp4',alto=1002,titulo='Vídeo del proyecto Huevo')],
  equipo=None),
]
order=[p['slug'] for p in P]
def sec(p):
  nxt=order[(order.index(p['slug'])+1)%len(order)]
  o=[f'    <!-- ============ PROYECTO: {p["titulo"].upper()} ============ -->',
     f'    <section class="view view--proyecto" id="view-{p["slug"]}" data-view="{p["slug"]}">',
     '      <div class="proyecto__cab">','        <div class="proyecto__izq">',
     f'          <h1 class="h1">{p["titulo"]}</h1>']
  if p.get('premio'): o.append('          <img class="proyecto__premio" src="assets/premio.svg" alt="Premio">')
  o.append(f'          <p class="gris">{p["rol"]}<br>{p["ano"]}</p>')
  if p['pills']:
    o.append('          <ul class="pills pills--row">')
    for i,row in enumerate(p['pills']):
      if i: o.append('            <li class="pills__salto" aria-hidden="true"></li>')
      for t in row: o.append(f'            <li class="pill">{t}</li>')
    o.append('          </ul>')
  o+=['        </div>','        <div class="proyecto__texto">']
  for par in p['texto']: o.append('          <p>'+' '.join(par)+'</p>')
  o+=['        </div>','      </div>','      <div class="proyecto__galeria">']
  for i,g in enumerate(p['galeria']):
    if 'youtube' in g:
      o.append(f'        <div class="proyecto__pieza proyecto__video proyecto__yt" style="aspect-ratio:1781 / {g["alto"]}">')
      o.append(f'          <iframe data-yt="{g["youtube"]}" src="https://www.youtube-nocookie.com/embed/{g["youtube"]}?enablejsapi=1&amp;playsinline=1&amp;rel=0&amp;modestbranding=1" title="{g["titulo"]}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>')
      o.append('        </div>')
      continue
    if 'carrusel' in g:
      st=f'aspect-ratio:1781 / {g["alto"]}'+(f';margin-top:calc(var(--u) * {g["separacion"]})' if g.get('separacion') else '')
      o.append(f'        <div class="proyecto__pieza carrusel" style="{st}" role="region" aria-roledescription="carrusel" aria-label="{g["titulo"]}">')
      o.append('          <div class="carrusel__pista" tabindex="0">')
      for k,(img,alt) in enumerate(g['carrusel']):
        o.append(f'            <figure class="carrusel__foto"><img src="assets/{img}" alt="{alt}" width="2000" height="1500" loading="lazy" draggable="false"></figure>')
      o.append('          </div>')
      o.append('          <button class="carrusel__btn carrusel__btn--ant" type="button" aria-label="Foto anterior"><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M38 12H3M13 2L3 12l10 10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')
      o.append('          <button class="carrusel__btn carrusel__btn--sig" type="button" aria-label="Foto siguiente"><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 12H37M27 2l10 10-10 10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')
      o.append('          <div class="carrusel__puntos">'+''.join(f'<button type="button" aria-label="Foto {k+1}"></button>' for k in range(len(g['carrusel'])))+'</div>')
      o.append('        </div>')
      continue
    if 'video' in g:
      st=f'aspect-ratio:1781 / {g["alto"]}'+(f';margin-top:calc(var(--u) * {g["separacion"]})' if g.get('separacion') else '')
      o.append(f'        <div class="proyecto__pieza proyecto__video proyecto__video--nativo" style="{st}"><video class="video-auto" src="assets/{g["video"]}" playsinline loop preload="metadata" aria-label="{g.get("titulo","Vídeo")}"></video></div>')
      continue
    if 'caja' in g:
      st=f'aspect-ratio:1781 / {g["alto"]}'+(f';margin-top:calc(var(--u) * {g["separacion"]})' if g.get('separacion') else '')
      o.append(f'        <div class="proyecto__pieza proyecto__video" style="{st}"><p>{g["caja"]}</p></div>')
      continue
    lazy='' if i==0 else ' loading="lazy"'
    tag=f'<img src="assets/{g["img"]}" alt="{g["alt"]}" width="{g["w"]}" height="{g["h"]}"{lazy}>'
    if i==0:
      o.append('        '+tag.replace('<img ','<img class="proyecto__img proyecto__hero" ',1)); continue
    if not g.get('notas') and not g.get('cajas'):
      o.append('        '+tag.replace('<img ','<img class="proyecto__pieza" ',1)); continue
    o.append(f'        <div class="proyecto__pieza proyecto__bloque" style="--h:{g["alto"]}">')
    o.append('          '+tag)
    for n in g.get('notas',[]):
      o.append(f'          <div class="proyecto__nota" style="--l:{n["l"]};--t:{n["t"]}">')
      for par in n['parrafos']: o.append('            <p>'+'<br>'.join(par)+'</p>')
      o.append('          </div>')
    for c in g.get('cajas',[]):
      if c.get('video'):
        o.append(f'          <div class="proyecto__caja proyecto__caja--video" style="--l:{c["l"]};--t:{c["t"]};--cw:{c["w"]};--ch:{c["h"]}"><video class="video-auto" src="assets/{c["video"]}" playsinline loop preload="metadata" aria-label="{c["titulo"]}"></video></div>')
        continue
      o.append(f'          <div class="proyecto__caja" style="--l:{c["l"]};--t:{c["t"]};--cw:{c["w"]};--ch:{c["h"]};--fs:{c["fs"]};--lh:{c["lh"]}"><p>{"<br>".join(c["texto"])}</p></div>')
    o.append('        </div>')
  o+=['      </div>','      <div class="proyecto__pie">']
  if p['equipo']:
    o+=['        <div class="proyecto__equipo gris">','          <p>EQUIPO DEL PROYECTO</p>','          <p>'+'<br>'.join(p['equipo'])+'</p>','        </div>']
  o+=[f'        <a class="btn-sig" href="#/{nxt}">SIGUIENTE PROYECTO',f'          {ARROW}','        </a>','      </div>','    </section>','']
  return '\n'.join(o)
f=root/'index.html'; h=f.read_text(encoding='utf-8')
a=h.index('    <!-- ============ PROYECTO: DOBRAONDAS'); b=h.index('  </main>')
f.write_text(h[:a]+'\n'.join(sec(p) for p in P)+'\n'+h[b:],encoding='utf-8')
print('páginas de proyecto generadas:',len(P))
