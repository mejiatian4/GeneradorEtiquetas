# Generador de Tirillas · KROTON

Mini aplicación web (HTML + JS) para generar las tirillas/etiquetas de producto de KROTON
con código de barras Code128, a tamaño exacto (2 × 6 cm + 0,5 cm de sangría).

## Estructura
```
index.html            Página principal
css/styles.css        Estilos
js/jsbarcode.min.js   Librería de códigos de barras (Code128)
js/app.js             Lógica del generador (dibuja la tirilla en canvas)
assets/logo-kroton.png Logo Kroton (dorado, transparente)
```

## Uso local
Ábrelo con un servidor local (recomendado para que la descarga de PNG funcione):
- VS Code: extensión "Live Server" → clic derecho en index.html → "Open with Live Server".
- O con Python:  `python -m http.server`  y entra a  http://localhost:8000

> Abrir index.html con doble clic (file://) funciona para ver y para imprimir,
> pero algunos navegadores bloquean "Descargar PNG" en modo archivo. Usa un servidor local o GitHub Pages.

## Publicar en GitHub Pages
1. Crea un repositorio nuevo y sube estos archivos (index.html en la raíz).
2. En el repo: Settings → Pages.
3. En "Build and deployment" → Source: **Deploy from a branch**.
4. Branch: **main** (o master) y carpeta **/ (root)** → Save.
5. Espera 1–2 min: tu página quedará en `https://TU-USUARIO.github.io/TU-REPO/`

## Notas
- La fuente **DM Sans** se carga desde Google Fonts (necesita internet la primera vez).
  Si el equipo tiene DM Sans instalada, también funciona sin conexión.
- El PNG se exporta con la resolución/medida exacta (3 × 7 cm reales, DPI embebido).
