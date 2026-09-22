document.addEventListener('DOMContentLoaded', () => {
  const vistaCaratula = document.getElementById('vistaCaratula');
  const visorContenido = document.getElementById('visorContenido');

  const btnLogoInicio = document.getElementById('btnLogoInicio');
  const btnNavInicio = document.getElementById('btnNavInicio');
  const btnNavRuleta = document.getElementById('btnNavRuleta');
  const btnNavSorteo = document.getElementById('btnNavSorteo');

  const tarjetaRuleta = document.getElementById('tarjetaRuleta');
  const tarjetaSorteo = document.getElementById('tarjetaSorteo');

  const tarjetas = [tarjetaRuleta, tarjetaSorteo];
  let indiceSeleccionado = -1;

  function activarBotonNav(botonActivo) {
    [btnNavInicio, btnNavRuleta, btnNavSorteo].forEach((btn) =>
      btn.classList.remove('enlace-activo')
    );
    botonActivo.classList.add('enlace-activo');
  }

  function mostrarCaratula() {
    visorContenido.classList.add('visor-oculto');
    visorContenido.src = '';
    vistaCaratula.style.display = 'flex';
    activarBotonNav(btnNavInicio);
    actualizarSeleccion(-1);
  }

  function mostrarModulo(ruta, botonNav) {
    vistaCaratula.style.display = 'none';
    visorContenido.classList.remove('visor-oculto');
    visorContenido.src = ruta;
    activarBotonNav(botonNav);
  }

  btnLogoInicio.addEventListener('click', mostrarCaratula);
  btnNavInicio.addEventListener('click', mostrarCaratula);

  btnNavRuleta.addEventListener('click', () => mostrarModulo('ruleta/index.html', btnNavRuleta));
  tarjetaRuleta.addEventListener('click', () => mostrarModulo('ruleta/index.html', btnNavRuleta));

  btnNavSorteo.addEventListener('click', () =>
    mostrarModulo('sorteoequipos/index.html', btnNavSorteo)
  );
  tarjetaSorteo.addEventListener('click', () =>
    mostrarModulo('sorteoequipos/index.html', btnNavSorteo)
  );

  function actualizarSeleccion(nuevoIndice) {
    tarjetas.forEach((tarjeta, i) => {
      if (i === nuevoIndice) {
        tarjeta.classList.add('tarjeta-activa');
      } else {
        tarjeta.classList.remove('tarjeta-activa');
        tarjeta.style.transform = '';
      }
    });
    indiceSeleccionado = nuevoIndice;
  }

  window.addEventListener('keydown', (e) => {
    if (vistaCaratula.style.display === 'none') {
      if (e.key === 'Escape') {
        mostrarCaratula();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const siguiente = indiceSeleccionado === -1 ? 0 : (indiceSeleccionado + 1) % tarjetas.length;
      actualizarSeleccion(siguiente);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const anterior =
        indiceSeleccionado === -1
          ? tarjetas.length - 1
          : (indiceSeleccionado - 1 + tarjetas.length) % tarjetas.length;
      actualizarSeleccion(anterior);
    } else if (e.key === 'Enter') {
      if (indiceSeleccionado === 0) {
        mostrarModulo('ruleta/index.html', btnNavRuleta);
      } else if (indiceSeleccionado === 1) {
        mostrarModulo('sorteoequipos/index.html', btnNavSorteo);
      }
    }
  });

  tarjetas.forEach((tarjeta, index) => {
    tarjeta.addEventListener('mouseenter', () => {
      actualizarSeleccion(index);
    });

    tarjeta.addEventListener('mousemove', (e) => {
      const dimensiones = tarjeta.getBoundingClientRect();
      const centroX = dimensiones.width / 2;
      const centroY = dimensiones.height / 2;
      const coordenadaX = e.clientX - dimensiones.left;
      const coordenadaY = e.clientY - dimensiones.top;

      const rotacionX = ((coordenadaY - centroY) / centroY) * -7;
      const rotacionY = ((coordenadaX - centroX) / centroX) * 7;

      const escala = tarjeta.classList.contains('tarjeta-activa') ? 'scale(1.02)' : '';
      tarjeta.style.transform = `perspective(1000px) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg) translateY(-4px) ${escala}`;
    });

    tarjeta.addEventListener('mouseleave', () => {
      if (tarjeta.classList.contains('tarjeta-activa')) {
        tarjeta.style.transform = 'translateY(-6px) scale(1.02)';
      } else {
        tarjeta.style.transform = '';
      }
    });
  });
});
