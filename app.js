"use strict";

/* =========================================================
   1. INICIALIZACIÓN DE LA INTERFAZ
   Se ejecuta con "defer": el DOM ya está analizado.
   ========================================================= */
const btnTheme = document.getElementById("btnTheme");
const formFeedback = document.getElementById("formFeedback");
const inputAutor = document.getElementById("autor");
const selectProyecto = document.getElementById("proyecto");
const textareaComentario = document.getElementById("comentario");
const comentariosContainer = document.getElementById("comentariosContainer");
const sinComentarios = document.getElementById("sinComentarios");
const formStatus = document.getElementById("formStatus");

const PROYECTOS_VALIDOS = ["Ecos del Valle", "CyberCity 2026"];
const MIN_NOMBRE = 5;
const MIN_COMENTARIO = 10;

const prefiereMenosMovimiento = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const esModoOscuro = () => document.body.classList.contains("dark-mode");

/* =========================================================
   2. CAMBIO DE TEMA
   ========================================================= */
const themeText = btnTheme.querySelector(".theme-text");
const themeIconWrap = btnTheme.querySelector(".theme-icon-wrap");

// Sincroniza texto del botón con el estado real del tema
const sincronizarBotonTema = () => {
  themeText.textContent = esModoOscuro() ? "Modo Claro" : "Modo Oscuro";
};

// Anima el icono desde su posición anterior (FLIP) hasta la nueva
const animarIconoTema = (posicionAnterior) => {
  if (prefiereMenosMovimiento()) return;
  const dx = posicionAnterior - themeIconWrap.getBoundingClientRect().left;
  themeIconWrap.style.setProperty("--dx", `${dx}px`);
  themeIconWrap.classList.remove("is-moving");
  void themeIconWrap.offsetWidth; // reinicia la animación
  themeIconWrap.classList.add("is-moving");
};

themeIconWrap.addEventListener("animationend", () => {
  themeIconWrap.classList.remove("is-moving");
});

btnTheme.addEventListener("click", () => {
  const posicionAnterior = themeIconWrap.getBoundingClientRect().left;
  document.body.classList.toggle("dark-mode");
  sincronizarBotonTema();
  animarIconoTema(posicionAnterior);
});

sincronizarBotonTema(); // estado inicial: modo claro

/* =========================================================
   3. CONTADORES Y ANIMACIONES DE LIKES
   ========================================================= */
const crearPulgarFlotante = (boton) => {
  if (prefiereMenosMovimiento()) return;

  const contenedor = boton.parentElement; // .card-actions (position: relative)
  const pulgar = document.createElement("span");
  pulgar.className = "like-float";
  pulgar.setAttribute("aria-hidden", "true");
  pulgar.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" focusable="false">' +
    '<path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';
  // (HTML fijo y propio: no incluye datos del usuario)

  const desplazamiento = Math.round(Math.random() * 40 - 20); // -20px a 20px
  pulgar.style.setProperty("--dx", `${desplazamiento}px`);
  pulgar.style.left = `${boton.offsetLeft + boton.offsetWidth / 2}px`;
  pulgar.style.top = `${boton.offsetTop}px`;

  const eliminar = () => pulgar.remove();
  pulgar.addEventListener("animationend", eliminar);
  setTimeout(eliminar, 1200); // respaldo por si no se dispara animationend

  contenedor.appendChild(pulgar);
};

document.querySelectorAll(".btn-like").forEach((boton) => {
  const contador = boton.querySelector(".like-count");
  let total = 0; // estado independiente por tarjeta

  boton.addEventListener("click", () => {
    total += 1;
    contador.textContent = total;
    crearPulgarFlotante(boton);
  });
});

/* =========================================================
   4. VALIDACIÓN DEL FORMULARIO
   Cada función devuelve un mensaje de error, o "" si es válido.
   ========================================================= */
const validarNombre = (valor) => {
  if (valor === "") return "Escribe tu nombre completo.";
  if (/^[\d\s]+$/.test(valor)) {
    return "El nombre no puede estar formado solo por números.";
  }
  if (valor.length < MIN_NOMBRE) {
    return `El nombre debe tener al menos ${MIN_NOMBRE} caracteres.`;
  }
  const partes = valor.split(/\s+/);
  if (partes.length < 2) {
    return "Escribe al menos un nombre y un apellido.";
  }
  const patronParte = /^\p{L}+(?:['’-]\p{L}+)*\.?$/u; // tildes, guiones, apóstrofos
  if (!partes.every((parte) => patronParte.test(parte))) {
    return "El nombre solo puede contener letras, tildes, guiones o apóstrofos.";
  }
  return "";
};

const validarProyecto = (valor) => {
  if (valor === "") return "Selecciona el proyecto que quieres valorar.";
  if (!PROYECTOS_VALIDOS.includes(valor)) {
    return "El proyecto seleccionado no es válido.";
  }
  return "";
};

const validarComentario = (valor) => {
  if (valor === "") return "Escribe tu comentario técnico.";
  if (valor.length < MIN_COMENTARIO) {
    return `El comentario debe tener al menos ${MIN_COMENTARIO} caracteres (tienes ${valor.length}).`;
  }
  return "";
};

/* =========================================================
   5. CREACIÓN DE COMENTARIOS (sin innerHTML con datos del usuario)
   ========================================================= */
const crearTarjetaComentario = (autor, proyecto, comentario) => {
  const tarjeta = document.createElement("article");
  tarjeta.className = "comment-card comment-enter";
  tarjeta.addEventListener(
    "animationend",
    () => tarjeta.classList.remove("comment-enter"),
    { once: true },
  );

  const encabezado = document.createElement("div");
  encabezado.className = "comment-header";

  const nombre = document.createElement("h4");
  nombre.className = "comment-author";
  nombre.textContent = autor;

  const proyectoTexto = document.createElement("span");
  proyectoTexto.className = "comment-project";
  proyectoTexto.textContent = `Proyecto: ${proyecto}`;

  const texto = document.createElement("p");
  texto.className = "comment-text";
  texto.textContent = comentario;

  encabezado.appendChild(nombre);
  encabezado.appendChild(proyectoTexto);
  tarjeta.appendChild(encabezado);
  tarjeta.appendChild(texto);

  return tarjeta;
};

/* =========================================================
   6. CONFIRMACIONES (SweetAlert2) Y CONFETI
   ========================================================= */
const estiloSwal = () =>
  esModoOscuro()
    ? { background: "#2d3748", color: "#edf2f7" }
    : { background: "#ffffff", color: "#2d3748" };

// Muestra una alerta con SweetAlert2; si la librería no cargó, avisa sin ocultar el error
const notificar = (opciones) => {
  if (typeof Swal === "undefined") {
    console.error("SweetAlert2 no está disponible: revisa la carga del CDN.");
    formStatus.textContent = [opciones.title, opciones.text]
      .filter(Boolean)
      .join(". ");
    return Promise.resolve();
  }
  formStatus.textContent = "";
  return Swal.fire({
    ...estiloSwal(),
    confirmButtonColor: "#3182ce",
    confirmButtonText: "Entendido",
    returnFocus: false,
    ...opciones,
  });
};

const mostrarError = (mensaje, campo) =>
  notificar({
    icon: "error",
    title: "Revisa el formulario",
    text: mensaje,
  }).then(() => campo.focus());

const lanzarConfeti = () => {
  if (typeof confetti !== "function") {
    console.error("Canvas-Confetti no está disponible: revisa la carga del CDN.");
    return;
  }
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 35,
    ticks: 120,
    origin: { y: 0.7 },
    zIndex: 2000, // por encima del modal de SweetAlert2
    disableForReducedMotion: true,
  });
};

/* ---------- Envío del formulario ---------- */
formFeedback.addEventListener("submit", (event) => {
  event.preventDefault(); // evita la recarga de la página

  const autor = inputAutor.value.trim();
  const proyecto = selectProyecto.value;
  const comentario = textareaComentario.value.trim();

  // Validación en orden: nombre -> proyecto -> comentario
  const errorNombre = validarNombre(autor);
  if (errorNombre) {
    mostrarError(errorNombre, inputAutor);
    return;
  }

  const errorProyecto = validarProyecto(proyecto);
  if (errorProyecto) {
    mostrarError(errorProyecto, selectProyecto);
    return;
  }

  const errorComentario = validarComentario(comentario);
  if (errorComentario) {
    mostrarError(errorComentario, textareaComentario);
    return;
  }

  // Publicación: solo se confirma si el nodo realmente quedó en el DOM
  try {
    const tarjeta = crearTarjetaComentario(autor, proyecto, comentario);
    comentariosContainer.appendChild(tarjeta);
    if (!comentariosContainer.contains(tarjeta)) {
      throw new Error("La tarjeta no se añadió al DOM.");
    }
  } catch (error) {
    console.error("No se pudo publicar la valoración:", error);
    notificar({
      icon: "error",
      title: "No se pudo publicar",
      text: "Ocurrió un problema al añadir tu valoración. Inténtalo de nuevo.",
    });
    return;
  }

  sinComentarios.hidden = true; // oculta el mensaje de lista vacía
  formFeedback.reset();

  notificar({
    icon: "success",
    title: "¡Valoración publicada!",
    text: `Gracias por valorar "${proyecto}".`,
    confirmButtonText: "Genial",
  });
  lanzarConfeti(); // una sola vez por publicación exitosa
});