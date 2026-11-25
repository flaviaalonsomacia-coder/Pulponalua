# pulponalua — portfolio

Sitio estático (HTML/CSS/JS puro, sin dependencias ni build). Solo hay que subir `index.html` y la carpeta `assets/` a cualquier hosting estático.

## 1. Subir a GitHub

```bash
cd portfolio-site
git init
git add .
git commit -m "Primera versión del portfolio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(Crea antes el repo vacío en https://github.com/new — sin README ni .gitignore, para que no choque con este `git push`).

## 2. Publicarlo con Cloudflare Pages

1. Entra en https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Autoriza Cloudflare para acceder a tu cuenta de GitHub y elige este repositorio.
3. En la configuración de build:
   - **Framework preset:** None
   - **Build command:** (déjalo vacío)
   - **Build output directory:** `/`
4. Deploy. En unos segundos tendrás una URL tipo `tu-repo.pages.dev` ya funcionando.

Cada vez que hagas `git push` a `main`, Cloudflare Pages volverá a desplegar automáticamente.

## 3. Comprar el dominio en Cloudflare

1. En el dashboard de Cloudflare → **Domain Registration** → **Register Domain**.
2. Busca el dominio que quieras (p. ej. `pulponalua.com`) y complétalo con tu método de pago — esto lo tienes que hacer tú directamente en Cloudflare, es una compra con tus propios datos de pago.
3. Una vez comprado, aparecerá automáticamente en tu cuenta de Cloudflare con su propia zona DNS.

## 4. Conectar el dominio al proyecto de Pages

1. En el proyecto de Pages que creaste en el paso 2 → pestaña **Custom domains** → **Set up a custom domain**.
2. Escribe tu dominio (p. ej. `pulponalua.com`) y confirma.
3. Cloudflare añadirá automáticamente los registros DNS necesarios (al ser el mismo dominio comprado en Cloudflare, se conecta solo, sin pasos manuales de DNS).
4. En unos minutos el dominio apuntará directamente a tu portfolio.

## Estructura

```
index.html      → toda la web (HTML + CSS + JS inline)
assets/         → imágenes, vídeos e iconos SVG
```
