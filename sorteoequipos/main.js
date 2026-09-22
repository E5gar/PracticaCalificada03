// ===== Referencias DOM =====
const textareaParticipantes = document.getElementById('textareaParticipantes');
const contadorParticipantes = document.getElementById('contadorParticipantes');
const radioCantidadEquipos = document.getElementById('radioCantidadEquipos');
const radioParticipantesPorEquipo = document.getElementById('radioParticipantesPorEquipo');
const selectValorDivision = document.getElementById('selectValorDivision');
const inputTituloEquipos = document.getElementById('inputTituloEquipos');
const botonLimpiar = document.getElementById('botonLimpiar');
const botonGenerar = document.getElementById('botonGenerar');

const pantallaConfiguracion = document.getElementById('pantallaConfiguracion');
const pantallaResultados = document.getElementById('pantallaResultados');
const tituloResultados = document.getElementById('tituloResultados');
const contenedorEquipos = document.getElementById('contenedorEquipos');
const botonDescargarJPG = document.getElementById('botonDescargarJPG');
const botonCopiarTexto = document.getElementById('botonCopiarTexto');
const botonCopiarColumnas = document.getElementById('botonCopiarColumnas');
const botonVolver = document.getElementById('botonVolver');

const CLAVE_ALMACENAMIENTO = 'sorteoEquipos_participantes';
const LIMITE_CARACTERES_PARTICIPANTE = 50;
const LIMITE_PARTICIPANTES = 100;

let equiposGenerados = [];

// ===== F1: participantes + localStorage =====
function obtenerListaParticipantes() {
  return textareaParticipantes.value
    .split('\n')
    .map(linea => linea.trim())
    .filter(linea => linea.length > 0);
}

function actualizarContadorParticipantes() {
  const total = obtenerListaParticipantes().length;
  contadorParticipantes.textContent = `${total} / ${LIMITE_PARTICIPANTES} participantes`;
  contadorParticipantes.classList.toggle('limite-excedido', total > LIMITE_PARTICIPANTES);
}

function guardarParticipantesEnAlmacenamiento() {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, textareaParticipantes.value);
}

function cargarParticipantesDesdeAlmacenamiento() {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (guardado !== null) textareaParticipantes.value = guardado;
}

function validarParticipantes(lista) {
  if (lista.length === 0) {
    return { valido: false, mensaje: 'Ingresa al menos un participante.' };
  }
  if (lista.length > LIMITE_PARTICIPANTES) {
    return { valido: false, mensaje: `Máximo ${LIMITE_PARTICIPANTES} participantes (tienes ${lista.length}).` };
  }
  const nombreLargo = lista.find(n => n.length > LIMITE_CARACTERES_PARTICIPANTE);
  if (nombreLargo) {
    return { valido: false, mensaje: `"${nombreLargo}" supera los ${LIMITE_CARACTERES_PARTICIPANTE} caracteres.` };
  }
  return { valido: true, mensaje: '' };
}

// ===== F2: modo de división =====
function obtenerModoDivision() {
  return document.querySelector('input[name="modoDivision"]:checked').value;
}

function actualizarOpcionesDivision() {
  const total = obtenerListaParticipantes().length || 1;
  const modo = obtenerModoDivision();
  const valorPrevio = selectValorDivision.value;

  selectValorDivision.innerHTML = '';

  if (modo === 'cantidadEquipos') {
    const maximo = Math.max(2, total);
    for (let n = 2; n <= maximo; n++) {
      const opcion = document.createElement('option');
      opcion.value = n;
      opcion.textContent = `${n} equipos`;
      selectValorDivision.appendChild(opcion);
    }
  } else {
    for (let n = 1; n <= total; n++) {
      const opcion = document.createElement('option');
      opcion.value = n;
      opcion.textContent = `${n} participante${n > 1 ? 's' : ''} por equipo`;
      selectValorDivision.appendChild(opcion);
    }
  }

  if ([...selectValorDivision.options].some(o => o.value === valorPrevio)) {
    selectValorDivision.value = valorPrevio;
  }
}

// ===== F3: generar y revelar equipos =====
function calcularTamanosEquipos(total, modo, valor) {
  const tamanos = [];

  if (modo === 'cantidadEquipos') {
    const numeroEquipos = Math.max(1, Math.min(valor, total));
    const base = Math.floor(total / numeroEquipos);
    let resto = total % numeroEquipos;
    for (let i = 0; i < numeroEquipos; i++) {
      tamanos.push(base + (resto > 0 ? 1 : 0));
      if (resto > 0) resto--;
    }
  } else {
    const tamanoEquipo = Math.max(1, Math.min(valor, total));
    let restante = total;
    while (restante > 0) {
      const actual = Math.min(tamanoEquipo, restante);
      tamanos.push(actual);
      restante -= actual;
    }
  }

  return tamanos;
}

function mezclarArreglo(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function generarEquipos() {
  const participantes = obtenerListaParticipantes();
  const validacion = validarParticipantes(participantes);
  if (!validacion.valido) {
    alert(validacion.mensaje);
    return;
  }

  const modo = obtenerModoDivision();
  const valor = parseInt(selectValorDivision.value, 10);
  const tamanos = calcularTamanosEquipos(participantes.length, modo, valor);
  const mezclados = mezclarArreglo(participantes);

  const equipos = [];
  let indice = 0;
  for (const tamano of tamanos) {
    equipos.push(mezclados.slice(indice, indice + tamano));
    indice += tamano;
  }

  equiposGenerados = equipos;
  mostrarPantallaResultados(equipos);
}

function crearTarjetasEquipos(equipos) {
  contenedorEquipos.innerHTML = '';
  const listas = [];

  equipos.forEach((equipo, i) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'equipo-tarjeta';

    const subtitulo = document.createElement('h3');
    subtitulo.className = 'equipo-subtitulo';
    subtitulo.textContent = `Equipo ${i + 1}`;

    const lista = document.createElement('ul');
    lista.className = 'lista-integrantes';

    tarjeta.append(subtitulo, lista);
    contenedorEquipos.appendChild(tarjeta);
    listas.push(lista);
  });

  return listas;
}

function revelarIntegrantesSecuencialmente(equipos, listas) {
  const RETRASO_MS = 180;
  let equipoActual = 0;
  let integranteActual = 0;

  function revelarSiguiente() {
    if (equipoActual >= equipos.length) return;

    const integrantes = equipos[equipoActual];
    if (integranteActual >= integrantes.length) {
      equipoActual++;
      integranteActual = 0;
      revelarSiguiente();
      return;
    }

    const item = document.createElement('li');
    item.className = 'integrante';
    item.textContent = integrantes[integranteActual];
    listas[equipoActual].appendChild(item);

    integranteActual++;
    setTimeout(revelarSiguiente, RETRASO_MS);
  }

  revelarSiguiente();
}

function mostrarPantallaResultados(equipos) {
  pantallaConfiguracion.hidden = true;
  pantallaResultados.hidden = false;
  tituloResultados.textContent = inputTituloEquipos.value.trim() || 'Resultado del Sorteo';

  const listas = crearTarjetasEquipos(equipos);
  revelarIntegrantesSecuencialmente(equipos, listas);
}

function volverAConfiguracion() {
  pantallaResultados.hidden = true;
  pantallaConfiguracion.hidden = false;
}

function limpiarFormulario() {
  textareaParticipantes.value = '';
  localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  inputTituloEquipos.value = '';
  actualizarContadorParticipantes();
  actualizarOpcionesDivision();
}

// ===== F4: acciones sobre el resultado =====
function avisarCopiado(boton) {
  const original = boton.textContent;
  boton.textContent = '¡Copiado!';
  setTimeout(() => { boton.textContent = original; }, 1200);
}

function copiarTextoAlPortapapeles() {
  const texto = equiposGenerados
    .map((equipo, i) => `Equipo ${i + 1}: ${equipo.join(', ')}`)
    .join('\n');
  navigator.clipboard.writeText(texto).then(() => avisarCopiado(botonCopiarTexto));
}

function copiarEquiposPorColumnas() {
  const maxFilas = Math.max(...equiposGenerados.map(e => e.length));
  const encabezado = equiposGenerados.map((_, i) => `Equipo ${i + 1}`).join('\t');
  const filas = [encabezado];

  for (let fila = 0; fila < maxFilas; fila++) {
    filas.push(equiposGenerados.map(equipo => equipo[fila] || '').join('\t'));
  }

  navigator.clipboard.writeText(filas.join('\n')).then(() => avisarCopiado(botonCopiarColumnas));
}

function descargarResultadosComoJPG() {
  const columnas = Math.min(3, equiposGenerados.length);
  const filasGrid = Math.ceil(equiposGenerados.length / columnas);
  const maxIntegrantes = Math.max(...equiposGenerados.map(e => e.length));

  const anchoTarjeta = 220;
  const altoTarjeta = 50 + maxIntegrantes * 22 + 16;
  const margen = 20;

  const canvas = document.createElement('canvas');
  canvas.width = columnas * (anchoTarjeta + margen) + margen;
  canvas.height = 90 + filasGrid * (altoTarjeta + margen);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f6f4ef';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1b2430';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(tituloResultados.textContent, canvas.width / 2, 45);

  equiposGenerados.forEach((equipo, i) => {
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = margen + col * (anchoTarjeta + margen);
    const y = 80 + fila * (altoTarjeta + margen);

    ctx.strokeStyle = '#23685f';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, anchoTarjeta, altoTarjeta);

    ctx.fillStyle = '#184b44';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Equipo ${i + 1}`, x + 12, y + 24);

    ctx.fillStyle = '#1b2430';
    ctx.font = '13px Arial';
    equipo.forEach((nombre, j) => ctx.fillText(nombre, x + 12, y + 46 + j * 22));
  });

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${tituloResultados.textContent || 'equipos'}.jpg`;
    enlace.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 0.92);
}

// ===== Inicialización y eventos =====
cargarParticipantesDesdeAlmacenamiento();
actualizarContadorParticipantes();
actualizarOpcionesDivision();

textareaParticipantes.addEventListener('input', () => {
  guardarParticipantesEnAlmacenamiento();
  actualizarContadorParticipantes();
  actualizarOpcionesDivision();
});

radioCantidadEquipos.addEventListener('change', actualizarOpcionesDivision);
radioParticipantesPorEquipo.addEventListener('change', actualizarOpcionesDivision);

botonGenerar.addEventListener('click', generarEquipos);
botonLimpiar.addEventListener('click', limpiarFormulario);
botonVolver.addEventListener('click', volverAConfiguracion);
botonDescargarJPG.addEventListener('click', descargarResultadosComoJPG);
botonCopiarTexto.addEventListener('click', copiarTextoAlPortapapeles);
botonCopiarColumnas.addEventListener('click', copiarEquiposPorColumnas);