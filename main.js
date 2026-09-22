document.addEventListener('DOMContentLoaded', () => {
  const tarjetas = document.querySelectorAll('.tarjeta-modulo');

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
