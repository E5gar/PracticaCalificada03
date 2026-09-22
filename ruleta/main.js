const lienzoRuleta = document.getElementById('lienzoRuleta');
const contextoRuleta = lienzoRuleta.getContext('2d');
const cajaRespuesta = document.getElementById('respuesta');
const botonIniciar = document.getElementById('botonIniciar');
const avisoGirar = document.getElementById('avisoGirar');

// 5 colores básicos; si hay más de 5 elementos se repiten
const COLORES_BASICOS = [
  '#fa8072',
  '#90ee90',
  '#f5deb3',
  '#dda0dd',
  '#4169e1'
];

let elementosRuleta = [];
let anguloActual = 0;
let estaGirando = false;
let ultimoSorteado = null;

/* Dibuja la ruleta */
function dibujarRuleta(listaElementos) {

  if (listaElementos) {
    elementosRuleta = listaElementos;
  }

  const tamanio = lienzoRuleta.width;
  const centro = tamanio / 2;
  const radio = centro - 30;
  const totalElementos = elementosRuleta.length;

  contextoRuleta.clearRect(0, 0, tamanio, tamanio);

  if (totalElementos === 0) {

    contextoRuleta.beginPath();
    contextoRuleta.arc(
      centro,
      centro,
      radio,
      0,
      2 * Math.PI
    );

    contextoRuleta.fillStyle = '#e0e0e0';
    contextoRuleta.fill();

    contextoRuleta.fillStyle = '#555';
    contextoRuleta.font = '22px Arial';
    contextoRuleta.textAlign = 'center';

    contextoRuleta.fillText(
      'Sin elementos',
      centro,
      centro + 60
    );

    dibujarTrianguloRojo(tamanio, centro);
    return;
  }

  const anguloSector =
    (2 * Math.PI) / totalElementos;

  const tamanioLetra =
    Math.max(
      12,
      Math.min(34, 320 / totalElementos)
    );

  elementosRuleta.forEach((elemento, indice) => {

    const anguloInicio =
      anguloActual +
      indice * anguloSector;

    const anguloFin =
      anguloInicio +
      anguloSector;

    contextoRuleta.beginPath();

    contextoRuleta.moveTo(
      centro,
      centro
    );

    contextoRuleta.arc(
      centro,
      centro,
      radio,
      anguloInicio,
      anguloFin
    );

    contextoRuleta.closePath();

    contextoRuleta.fillStyle =
      COLORES_BASICOS[
        indice % COLORES_BASICOS.length
      ];

    contextoRuleta.fill();

    contextoRuleta.strokeStyle = '#ffffff';
    contextoRuleta.lineWidth = 2;
    contextoRuleta.stroke();

    // Texto del sector
    contextoRuleta.save();

    contextoRuleta.translate(
      centro,
      centro
    );

    contextoRuleta.rotate(
      anguloInicio +
      anguloSector / 2
    );

    contextoRuleta.textAlign = 'right';
    contextoRuleta.textBaseline = 'middle';

    contextoRuleta.fillStyle = '#1a1a1a';

    contextoRuleta.font =
      `${tamanioLetra}px Arial`;

    const textoCorto =
      elemento.texto.length > 16
        ? elemento.texto.slice(0, 15) + '…'
        : elemento.texto;

    contextoRuleta.fillText(
      textoCorto,
      radio - 15,
      0
    );

    contextoRuleta.restore();
  });

  dibujarTrianguloRojo(
    tamanio,
    centro
  );
}

/* Triángulo rojo */
function dibujarTrianguloRojo(
  tamanio,
  centro
) {

  contextoRuleta.beginPath();

  contextoRuleta.moveTo(
    tamanio - 38,
    centro
  );

  contextoRuleta.lineTo(
    tamanio - 4,
    centro - 16
  );

  contextoRuleta.lineTo(
    tamanio - 4,
    centro + 16
  );

  contextoRuleta.closePath();

  contextoRuleta.fillStyle = '#e00000';

  contextoRuleta.fill();
}

/* Datos de prueba */
dibujarRuleta(
  Array.from(
    { length: 12 },
    (_, i) => ({
      texto: String(i + 1),
      indiceLinea: i
    })
  )
);

/* Devuelve el índice del sector seleccionado */
function obtenerIndiceSeleccionado() {

  const vueltaCompleta = 2 * Math.PI;

  const anguloSector =
    vueltaCompleta /
    elementosRuleta.length;

  const anguloBajoTriangulo =
    (
      vueltaCompleta -
      (
        anguloActual %
        vueltaCompleta
      )
    ) %
    vueltaCompleta;

  return Math.floor(
    anguloBajoTriangulo /
    anguloSector
  ) % elementosRuleta.length;
}

/* F3: gira la ruleta */
function girarRuleta() {

  if (
    estaGirando ||
    elementosRuleta.length === 0
  ) {
    return;
  }

  estaGirando = true;

  avisoGirar.hidden = true;

  cajaRespuesta.textContent =
    'Girando...';

  const anguloInicial =
    anguloActual;

  const vueltasAleatorias =
    5 + Math.random() * 5;

  const anguloFinal =
    anguloInicial +
    vueltasAleatorias *
    2 *
    Math.PI;

  const duracionGiro = 4000;

  const tiempoInicio =
    performance.now();

  function animarGiro(tiempoActual) {

    const progreso =
      Math.min(
        (tiempoActual - tiempoInicio) /
        duracionGiro,
        1
      );

    const progresoSuavizado =
      1 -
      Math.pow(
        1 - progreso,
        3
      );

    anguloActual =
      anguloInicial +
      (
        anguloFinal -
        anguloInicial
      ) *
      progresoSuavizado;

    dibujarRuleta();

    if (progreso < 1) {

      requestAnimationFrame(
        animarGiro
      );

    } else {

      anguloActual =
        anguloActual %
        (2 * Math.PI);

      estaGirando = false;

      mostrarElementoSeleccionado();
    }
  }

  requestAnimationFrame(
    animarGiro
  );
}

/* Muestra el resultado */
function mostrarElementoSeleccionado() {

  ultimoSorteado =
    elementosRuleta[
      obtenerIndiceSeleccionado()
    ];

  cajaRespuesta.textContent =
    ultimoSorteado.texto;
}

/* Click sobre la ruleta */
lienzoRuleta.addEventListener(
  'click',
  girarRuleta
);

/* Botón iniciar */
botonIniciar.addEventListener(
  'click',
  girarRuleta
);

/* Tecla SPACE */
document.addEventListener(
  'keydown',
  (evento) => {

    if (
      evento.target.tagName ===
      'TEXTAREA'
    ) {
      return;
    }

    if (
      evento.code === 'Space'
    ) {

      evento.preventDefault();

      girarRuleta();
    }
  }
);