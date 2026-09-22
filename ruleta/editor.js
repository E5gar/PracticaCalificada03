
const areaElementos = document.getElementById('areaElementos');
const vistaElementos = document.getElementById('vistaElementos');
const botonReiniciar = document.getElementById('botonReiniciar');
const botonEditar = document.getElementById('botonEditar');
const botonEsconder = document.getElementById('botonEsconder');
const botonTitulo = document.getElementById('botonTitulo');
const tituloRuleta = document.getElementById('tituloRuleta');

const CLAVE_ELEMENTOS = 'ruleta_elementos';
const CLAVE_OCULTOS = 'ruleta_ocultos';
const CLAVE_TITULO = 'ruleta_titulo';
const ELEMENTOS_POR_DEFECTO = '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12';

let indicesOcultos = new Set(); // números de línea ocultos

/* ---------- Lectura de datos ---------- */
function obtenerLineas() {
  return areaElementos.value.split('\n');
}

function obtenerElementosActivos() {
  return obtenerLineas()
    .map((texto, indiceLinea) => ({ texto: texto.trim(), indiceLinea }))
    .filter((elemento) => elemento.texto !== '' && !indicesOcultos.has(elemento.indiceLinea));
}

/* ---------- F4: localStorage ---------- */
function guardarEnAlmacenamiento() {
  localStorage.setItem(CLAVE_ELEMENTOS, areaElementos.value);
  localStorage.setItem(CLAVE_OCULTOS, JSON.stringify([...indicesOcultos]));
}

function recuperarDelAlmacenamiento() {
  const elementosGuardados = localStorage.getItem(CLAVE_ELEMENTOS);
  areaElementos.value = elementosGuardados !== null ? elementosGuardados : ELEMENTOS_POR_DEFECTO;

  const ocultosGuardados = localStorage.getItem(CLAVE_OCULTOS);
  indicesOcultos = new Set(ocultosGuardados ? JSON.parse(ocultosGuardados) : []);

  const tituloGuardado = localStorage.getItem(CLAVE_TITULO);
  if (tituloGuardado) tituloRuleta.textContent = tituloGuardado;
}

/* ---------- F5: sincronizar con la ruleta ---------- */
function actualizarRuletaYVista() {
  guardarEnAlmacenamiento();
  if (typeof dibujarRuleta === 'function') dibujarRuleta(obtenerElementosActivos());
  pintarVistaElementos();
}

/* Vista de lectura: permite resaltar líneas en gris (un textarea no puede) */
function pintarVistaElementos() {
  vistaElementos.innerHTML = '';
  obtenerLineas().forEach((texto, indiceLinea) => {
    const filaElemento = document.createElement('div');
    filaElemento.className = 'fila-elemento';
    filaElemento.textContent = texto || '\u00a0';
    if (indicesOcultos.has(indiceLinea)) filaElemento.classList.add('oculto');
    vistaElementos.appendChild(filaElemento);
  });
}

/* ---------- F7: edición ---------- */
function habilitarEdicion() {
  vistaElementos.hidden = true;
  areaElementos.hidden = false;
  areaElementos.focus();
}

function terminarEdicion() {
  areaElementos.hidden = true;
  vistaElementos.hidden = false;
  pintarVistaElementos();
}

/* ---------- F6: ocultar el último sorteado ---------- */
function ocultarElementoSorteado() {
  if (typeof ultimoSorteado === 'undefined' || !ultimoSorteado) return;
  indicesOcultos.add(ultimoSorteado.indiceLinea);
  ultimoSorteado = null;
  actualizarRuletaYVista();
}

/* ---------- F8: reiniciar ---------- */
function reiniciarRuleta() {
  indicesOcultos.clear();
  if (typeof ultimoSorteado !== 'undefined') ultimoSorteado = null;
  document.getElementById('respuesta').textContent = 'RESPUESTA';
  actualizarRuletaYVista();
}

/* ---------- F9: pantalla completa ---------- */
function alternarPantallaCompleta() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function cambiarTitulo() {
  const nuevoTitulo = prompt('Título de la ruleta:', tituloRuleta.textContent);
  if (nuevoTitulo && nuevoTitulo.trim()) {
    tituloRuleta.textContent = nuevoTitulo.trim();
    localStorage.setItem(CLAVE_TITULO, tituloRuleta.textContent);
  }
}

/* ---------- Eventos ---------- */
areaElementos.addEventListener('input', actualizarRuletaYVista); // incluye pegar multifila
areaElementos.addEventListener('blur', terminarEdicion);
vistaElementos.addEventListener('click', habilitarEdicion);
botonEditar.addEventListener('click', habilitarEdicion);
botonEsconder.addEventListener('click', ocultarElementoSorteado);
botonReiniciar.addEventListener('click', reiniciarRuleta);
botonTitulo.addEventListener('click', cambiarTitulo);

document.addEventListener('keydown', (evento) => {
  if (evento.target === areaElementos) {
    if (evento.key === 'Escape') areaElementos.blur(); // salir de edición
    return; // mientras se edita, las letras se escriben normal
  }
  switch (evento.key.toLowerCase()) {
    case 's': ocultarElementoSorteado(); break;
    case 'e': evento.preventDefault(); habilitarEdicion(); break;
    case 'r': reiniciarRuleta(); break;
    case 'f': alternarPantallaCompleta(); break;
  }
});

/* ---------- Inicio ---------- */
recuperarDelAlmacenamiento();
actualizarRuletaYVista();
