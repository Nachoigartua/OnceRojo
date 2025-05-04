// src/utils/horaArgentina.js
export function obtenerFechaArgentina() {
  const ahora = new Date();
  const argentinaOffset = 3 * 60; // UTC-3
  const local = new Date(ahora.getTime() - argentinaOffset * 60000);
  return local.toISOString().slice(0, 10);
}

export function calcularTiempoHastaMedianocheArgentina() {
  const ahora = new Date();

  // Crear un nuevo objeto con la fecha de mañana a las 00:00:00
  const medianoche = new Date(ahora);
  medianoche.setDate(medianoche.getDate() + 1); // Cambiar al siguiente día
  medianoche.setHours(0, 0, 0, 0); // Establecer la hora en 00:00:00

  // Calcular la diferencia en milisegundos
  const diferencia = medianoche - ahora;

  // Convertir la diferencia a horas, minutos y segundos
  const horas = String(Math.floor(diferencia / (1000 * 60 * 60))).padStart(2, '0');
  const minutos = String(Math.floor((diferencia / (1000 * 60)) % 60)).padStart(2, '0');
  const segundos = String(Math.floor((diferencia / 1000) % 60)).padStart(2, '0');

  return `${horas}:${minutos}:${segundos}`;
}

