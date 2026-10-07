/* =========================================================
   Moca & Resto — JavaScript (sin frameworks)
   ========================================================= */

/* ---------- Configuración: edita aquí tus datos ---------- */
const CONFIG = {
  // Número de WhatsApp con código de país, sin "+", espacios ni guiones (Ecuador = 593).
  whatsapp: "593990000000",
  mensajeWhatsapp: "¡Hola Moca & Resto! Quisiera hacer una consulta / reserva.",
  menuUrl: "menu.json",
};

const ETIQUETAS = {
  vegano: "Vegano",
  vegetariano: "Vegetariano",
  picante: "Picante",
  "sin-gluten": "Sin gluten",
};

/* ---------- Utilidades ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text; // textContent evita inyectar HTML
  return node;
}

function formatoPrecio(valor, moneda) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return String(valor ?? "");
  return `${moneda}${n.toFixed(2)}`;
}

/* ---------- Navegación móvil ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ---------- WhatsApp ---------- */
function initWhatsApp() {
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWhatsapp)}`;
  document.querySelectorAll(".js-whatsapp").forEach((a) => {
    a.href = url;
  });
}

/* ---------- Menú (desde menu.json) ---------- */
function renderPlato(plato, moneda) {
  const disponible = plato.disponible !== false;
  const li = el("li", disponible ? "dish" : "dish dish--agotado");

  const row = el("div", "dish__row");
  row.append(
    el("span", "dish__name", plato.nombre),
    el("span", "dish__dots"),
    el("span", "dish__price", formatoPrecio(plato.precio, moneda)),
  );
  li.append(row);

  if (plato.descripcion) li.append(el("p", "dish__desc", plato.descripcion));

  const tags = [];
  if (plato.destacado) tags.push(["destacado", "Recomendado"]);
  (plato.etiquetas || []).forEach((t) => tags.push([t, ETIQUETAS[t] || t]));
  if (!disponible) tags.push(["agotado", "Agotado"]);

  if (tags.length) {
    const wrap = el("div", "dish__tags");
    tags.forEach(([clase, texto]) => wrap.append(el("span", `tag tag--${clase}`, texto)));
    li.append(wrap);
  }
  return li;
}

function renderMenu(data) {
  const content = document.getElementById("menu-content");
  const tabs = document.getElementById("menu-tabs");
  const note = document.getElementById("menu-note");
  const moneda = data.moneda || "$";
  const categorias = Array.isArray(data.categorias) ? data.categorias : [];

  content.replaceChildren();
  tabs.replaceChildren();

  categorias.forEach((cat, i) => {
    const id = `cat-${cat.id || i}`;

    const section = el("section", "menu-category");
    section.id = id;
    section.append(el("h3", "menu-category__title", cat.nombre));
    if (cat.descripcion) section.append(el("p", "menu-category__desc", cat.descripcion));

    const list = el("ul", "dish-list");
    (cat.platos || []).forEach((p) => list.append(renderPlato(p, moneda)));
    section.append(list);
    content.append(section);

    const li = el("li");
    const btn = el("button", "menu-tab", cat.nombre);
    btn.type = "button";
    btn.dataset.target = id;
    btn.addEventListener("click", () => {
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
      marcarTab(id);
    });
    li.append(btn);
    tabs.append(li);
  });

  note.textContent = data.nota || "";
  observarCategorias();
}

function marcarTab(id) {
  document.querySelectorAll(".menu-tab").forEach((t) => {
    const activo = t.dataset.target === id;
    t.setAttribute("aria-current", String(activo));
    if (activo) t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
}

let observer;
function observarCategorias() {
  if (!("IntersectionObserver" in window)) return;
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) marcarTab(visible[0].target.id);
    },
    { rootMargin: "-35% 0px -60% 0px" },
  );
  document.querySelectorAll(".menu-category").forEach((s) => observer.observe(s));
}

async function cargarMenu() {
  const content = document.getElementById("menu-content");
  try {
    const res = await fetch(CONFIG.menuUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    renderMenu(await res.json());
  } catch (err) {
    console.error("No se pudo cargar el menú:", err);
    const msg = el("p", "menu-error");
    msg.textContent =
      location.protocol === "file:"
        ? "El menú no se puede leer abriendo el archivo directamente. Abre el sitio con un servidor local (ver README) o publícalo en internet."
        : "No pudimos cargar el menú en este momento. Escríbenos por WhatsApp y te lo enviamos.";
    content.replaceChildren(msg);
  }
}

/* ---------- Horarios: resaltar hoy y mostrar "Abierto / Cerrado" ---------- */
function aMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function initHorarios() {
  // Hora de Ecuador (UTC-5), sin importar la zona horaria del visitante.
  const ahoraEc = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const dia = ahoraEc.getUTCDay();
  const minutos = ahoraEc.getUTCHours() * 60 + ahoraEc.getUTCMinutes();

  const fila = document.querySelector(`.hours__table tr[data-day="${dia}"]`);
  const status = document.getElementById("open-status");
  if (!fila || !status) return;

  fila.classList.add("is-today");

  const { open, close } = fila.dataset;
  const abierto = Boolean(open && close) && minutos >= aMinutos(open) && minutos < aMinutos(close);

  status.textContent = abierto ? "Abierto ahora" : "Cerrado ahora";
  status.classList.add(abierto ? "is-open" : "is-closed");
  status.hidden = false;
}

/* ---------- Inicio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initWhatsApp();
  initHorarios();
  cargarMenu();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
