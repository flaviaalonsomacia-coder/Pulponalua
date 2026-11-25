# pulponalua · portfolio

Web estática (HTML + CSS + JS, sin dependencias) lista para **GitHub Pages**.

## Editar
- `js/config.js`: email, Instagram, **LinkedIn** (pon tu URL real) y el servicio del formulario.
- `_src/style.src.css`: estilos con medidas del diseño (1920 px). Tras editar, ejecuta `python3 _src/build.py` para regenerar `css/style.css`.
- `assets/`: imágenes, vectores y sonido.

## Formulario de contacto
Usa [FormSubmit](https://formsubmit.co). La **primera vez** que alguien envíe un mensaje recibirás un correo de activación en la dirección configurada: confírmalo y ya llegarán los mensajes.

## Publicar en GitHub Pages
```bash
git init -b main
git add .
git commit -m "Portfolio pulponalua"
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```
En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.
Tu web quedará en `https://TU-USUARIO.github.io/TU-REPO/`.

## Dominio propio
1. Compra el dominio en un registrador (Namecheap, Porkbun, Cloudflare, IONOS…).
2. En sus DNS crea 4 registros **A** para `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, y un **CNAME** `www` → `TU-USUARIO.github.io`.
3. En GitHub → Settings → Pages → **Custom domain** → escribe tu dominio y activa **Enforce HTTPS**.
