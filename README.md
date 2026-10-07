# Moca & Resto

Sitio web estático del café/restaurante **Moca & Resto** (Otavalo, Ecuador).
Solo HTML, CSS y JavaScript, sin frameworks. Diseñado primero para celular.

## Estructura

```
index.html        Página (inicio, menú, horarios, ubicación)
menu.json         ← El menú: categorías, platos y precios
css/styles.css    Estilos (vintage, papel kraft, café y crema)
js/main.js        Carga el menú, WhatsApp, navegación y "Abierto ahora"
images/           Favicon y tu foto principal (hero.jpg)
```

## Cambiar el menú (`menu.json`)

Cada categoría tiene un `nombre`, una `descripcion` opcional y una lista de `platos`:

```json
{ "nombre": "Capuchino", "descripcion": "Espresso y leche espumada.", "precio": 2.75 }
```

Campos opcionales de cada plato:

| Campo        | Ejemplo                       | Efecto                                   |
|--------------|-------------------------------|------------------------------------------|
| `destacado`  | `true`                        | Muestra la etiqueta "Recomendado"        |
| `etiquetas`  | `["vegano", "picante"]`       | Etiquetas: vegano, vegetariano, picante, sin-gluten |
| `disponible` | `false`                       | Lo tacha y marca como "Agotado"          |

Consejos: el precio va como número (`3.5`, no `"$3,50"`); cuida las comas entre
elementos y las comillas dobles. Si algo falla, pega el archivo en
<https://jsonlint.com> para encontrar el error.

## Otros datos a personalizar (todos son de ejemplo)

- **WhatsApp:** `js/main.js`, al inicio (`CONFIG.whatsapp`, formato `593` + número sin el 0).
- **Horarios:** tabla en `index.html` (sección `#horarios`). Los atributos
  `data-open` / `data-close` controlan el aviso "Abierto ahora / Cerrado ahora".
- **Dirección y mapa:** sección `#ubicacion` en `index.html`; cambia `q=` del
  `iframe` y `destination=` del botón por tu dirección o coordenadas.
- **Foto principal:** guarda tu foto como `images/hero.jpg` (horizontal,
  ~1600 px de ancho). Mientras no exista se muestra una foto de ejemplo de Unsplash.
- **Teléfono e Instagram:** pie de página en `index.html`.

## Ver el sitio en tu computadora

Como el menú se lee desde `menu.json`, hay que abrirlo con un servidor local
(abrir `index.html` con doble clic no carga el menú):

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Publicarlo

Sirve tal cual en GitHub Pages, Netlify o cualquier hosting estático:
en GitHub, *Settings → Pages → Deploy from a branch* y elige la rama y la carpeta raíz.
