<template>
<div class="adivina-la-camiseta-wrapper d-flex flex-wrap justify-content-center align-items-center min-vh-100 text-white position-relative w-100"
     style="background-color: #e70013;">
    <!-- IMAGEN IZQUIERDA -->
    <div class="imagen-container flex-grow-1 d-flex justify-content-center align-items-center p-4">
      <img
        :src="imagenSrc"
        alt="Camiseta del día"
        class="img-fluid rounded"
        style="max-width: 100%; max-height: 80vh;"
      />
    </div>

    <!-- RESPUESTAS DERECHA -->
    <div class="respuestas-container p-4 d-flex flex-column justify-content-center align-items-center" style="width: 40%; background-color: #a0000f; border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;">
      <h4 class="mb-4 text-white text-center">¿Qué camiseta es esta?</h4>
      <div class="w-100">
        <div
          class="mb-3"
          v-for="(opcion, index) in opciones"
          :key="index"
        >
          <button
            class="btn btn-light w-100"
            :class="{
              'btn-success': opcion === seleccionada && correcta,
              'btn-danger': opcion === seleccionada && !correcta
            }"
            :disabled="seleccionada !== null || yaRespondio"
            @click="verificarOpcion(opcion)"
          >
            {{ opcion }}
          </button>
        </div>
      </div>

      <div v-if="resultado" class="mt-4 text-white text-center">
        <p>{{ resultado }}</p>
        <p v-if="yaRespondio">Vuelve a intentarlo en {{ tiempoRestante }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const imagenSrc = ref('');
const opciones = ref([]);
const correctaDelDia = ref('');
const seleccionada = ref(null);
const correcta = ref(false);
const resultado = ref('');
const yaRespondio = ref(false);
const tiempoRestante = ref('');

// Función para calcular el tiempo restante hasta las 00:00 (hora de Argentina)
const calcularTiempoRestante = () => {
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setHours(24, 0, 0, 0); // Establece la hora a las 00:00 del día siguiente
  const diferencia = proximaMedianoche - ahora;

  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  tiempoRestante.value = `${horas}h ${minutos}m`;
};

// Función para verificar si el usuario ya respondió
const verificarRespuestaGuardada = () => {
  const hoy = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
  const respuestaGuardada = localStorage.getItem(`respuesta-${hoy}`);
  if (respuestaGuardada) {
    yaRespondio.value = true;
    calcularTiempoRestante();
    resultado.value = 'Ya has respondido hoy.';
  }
};

// Función para guardar la respuesta en localStorage
const guardarRespuesta = () => {
  const hoy = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
  localStorage.setItem(`respuesta-${hoy}`, 'respondido');
  yaRespondio.value = true;
  calcularTiempoRestante();
};

onMounted(async () => {
  const hoy = new Date().toISOString().slice(0, 10); // Obtiene la fecha actual en formato YYYY-MM-DD
  verificarRespuestaGuardada(); // Verifica si ya respondió
  try {
    const data = await fetch('/camisetas_adivina.json').then((res) => res.json());
    if (data[hoy]) {
      imagenSrc.value = data[hoy].imagen;
      opciones.value = data[hoy].opciones;
      correctaDelDia.value = data[hoy].correcta;
    } else {
      resultado.value = '📅 No hay contenido cargado para hoy.';
    }
  } catch (error) {
    console.error('Error al cargar el archivo JSON:', error);
    resultado.value = '❌ Error al cargar el contenido.';
  }
});

const verificarOpcion = (opcion) => {
  seleccionada.value = opcion;
  if (opcion === correctaDelDia.value) {
    correcta.value = true;
    resultado.value = '¡Correcto! 🎉';
  } else {
    correcta.value = false;
    resultado.value = 'Incorrecto 😕';
  }
  guardarRespuesta(); // Guarda la respuesta en localStorage
};
</script>

<style scoped>
.adivina-la-camiseta-wrapper {
  padding: -4rem;
}

.imagen-container {
  max-width: 700px;
  width: 100%;
  margin-top: 0px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

button {
  padding: 1rem 1.0rem;
  font-size: 1.0rem;
  font-weight: bold;
  border-radius: 10px;
  border: 2px solid white;
  background-color: white;
  color: black;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button.btn-success {
  background-color: #28a745 !important;
  color: white;
}

button.btn-danger {
  background-color: #dc3545 !important;
  color: white;
}
</style>