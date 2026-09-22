document.addEventListener('DOMContentLoaded', () => {
  const tarjetas = document.querySelectorAll('.tarjeta-modulo');

  let indiceSeleccionado = -1;

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
      if (indiceSeleccionado !== -1) {
        const enlace = tarjetas[indiceSeleccionado].querySelector('a');
        if (enlace) {
          enlace.click();
        }
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
