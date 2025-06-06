<template>
  <div class="intruso-container text-white text-center px-3">
    <h2 class="titulo-juego mb-2 animate-slide-in">🔎 Adiviná el Intruso 🔎</h2>
    <h3 class="subtitulo-juego mb-5">¿Quién no jugó en Independiente?</h3>

    <!-- Mensaje de "Ya respondiste hoy" -->
    <div v-if="yaJugado">
      <p class="fs-5">Ya has respondido hoy.</p>
      <h3 class="reloj">Vuelve a intentarlo en: {{ tiempoRestante }}</h3>
      <p class="mb-4 fs-5 animate-fade-in">Resultado: {{ mensajeResultado }}</p>
      <div class="row justify-content-center mt-4">
        <div
          class="col-10 col-md-4 mb-4"
          v-for="(opcion, index) in opciones"
          :key="index"
        >
          <button
            class="boton-opcion"
            :class="{
              'correcta': opcion === intruso,
              'incorrecta': opcion === respuestaGuardada && opcion !== intruso
            }"
            disabled
          >
            {{ opcion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Juego principal -->
    <div v-else-if="preguntaActual < 3">
      <div class="row justify-content-center">
        <div
          class="col-10 col-md-4 mb-4"
          v-for="(opcion, index) in opciones"
          :key="index"
        >
          <button
            class="boton-opcion"
            :disabled="respuestaSeleccionada"
            :class="{
              'correcta': respuestaSeleccionada && opcion === intruso,
              'incorrecta': respuestaSeleccionada && opcion === respuestaGuardada && opcion !== intruso
            }"
            @click="verificarRespuesta(opcion)"
          >
            {{ opcion }}
          </button>
        </div>
      </div>
      <div v-if="respuestaSeleccionada" class="mt-4 animate-slide-in">
        <p class="fs-5" :class="esCorrecta ? 'text-success' : 'text-danger'">
          {{ mensajeResultado }}
        </p>
       
        <button v-if="preguntaActual < 2" class="btn btn-primary mt-3" @click="siguientePregunta">
          Siguiente Pregunta
        </button>
      </div>
    </div>

    <!-- Mensaje final -->
    <div v-else-if="preguntaActual >= 3">
      <p class="fs-4" :class="correctas === 3 ? 'text-success' : 'text-danger'">
        {{ mensajeResultado }}
      </p>
      <p class="fs-5 text-warning">Vuelve a jugar en: {{ tiempoRestante }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerFechaArgentina, calcularTiempoHastaMedianocheArgentina } from '@/utils/horaArgentina';

const preguntas = ref([]);
const opciones = ref([]);
const intruso = ref('');
const preguntaActual = ref(0);
const respuestaSeleccionada = ref(false);
const esCorrecta = ref(false);
const mensajeResultado = ref('');
const yaJugado = ref(false);
const tiempoRestante = ref('');
const respuestaGuardada = ref('');
const preguntasGuardadas = ref([]);
const correctas = ref(0);

const obtenerFechaClave = () => obtenerFechaArgentina();

const calcularTiempoRestante = () => {
  tiempoRestante.value = calcularTiempoHastaMedianocheArgentina();
};

// Verificar la respuesta
const verificarRespuesta = (opcion) => {
  respuestaSeleccionada.value = true;
  esCorrecta.value = opcion === intruso.value;
  mensajeResultado.value = esCorrecta.value
    ? '✅ ¡Correcto!'
    : `❌ Incorrecto. El intruso era: ${intruso.value}`;

  if (esCorrecta.value) correctas.value++;

  const clave = obtenerFechaClave();
  preguntasGuardadas.value.push(preguntas.value[preguntaActual.value]);
  localStorage.setItem('preguntas-guardadas-' + clave, JSON.stringify(preguntasGuardadas.value));

  if (preguntaActual.value === 2) {
    mostrarMensajeFinal(clave);
  }
};

// Mostrar mensaje final si es la última pregunta
const mostrarMensajeFinal = (clave) => {
  if (correctas.value === 3) {
    mensajeResultado.value = "🎉 Felicidades, acertaste 3 de 3 preguntas. ¡Ganaste!";
  } else {
    mensajeResultado.value = `❌ Fallaste, Respondiste correctamente ${correctas.value} de 3 preguntas.`;
  }
  localStorage.setItem('respuesta-' + clave, 'true');
  localStorage.setItem('correctas-' + clave, correctas.value);
  localStorage.setItem('preguntas-guardadas-' + clave, JSON.stringify(preguntasGuardadas.value));
};

// Pasar a la siguiente pregunta
const siguientePregunta = () => {
  if (preguntaActual.value < 2) {
    preguntaActual.value++;
    cargarPreguntaActual();
    respuestaSeleccionada.value = false;
  } else {
    preguntaActual.value++;
    respuestaSeleccionada.value = false;
  }
};

// Función para mezclar las opciones de forma aleatoria
const mezclarOpciones = (array) => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

// Cargar la pregunta actual
const cargarPreguntaActual = () => {
  opciones.value = mezclarOpciones(preguntas.value[preguntaActual.value].opciones);
  intruso.value = preguntas.value[preguntaActual.value].intruso;
};

// Cargar el desafío del día desde el JSON
const cargarDatosDelDia = async () => {
  const clave = obtenerFechaClave();
  const fallback = '2025-05-04';
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}adivina-intruso.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const entradaHoy = data[clave] || data[fallback];
    if (entradaHoy) {
      preguntas.value = entradaHoy;
      cargarPreguntaActual();
    } else {
      console.warn('No hay desafío cargado para hoy ni para el fallback.');
    }
  } catch (error) {
    console.error('Error cargando el JSON:', error);
  }
};

// Formatear resultados para debug o mostrar historial
const formatearResultados = (preguntas) => {
  return preguntas
    .map((pregunta, index) => `Pregunta ${index + 1}: ${pregunta.intruso}`)
    .join(', ');
};

// Al montar el componente
onMounted(async () => {
  const clave = obtenerFechaClave();
  yaJugado.value = localStorage.getItem('respuesta-' + clave) === 'true';

  await cargarDatosDelDia();

  if (yaJugado.value) {
    respuestaGuardada.value = localStorage.getItem('seleccionada-' + clave) || '';
    intruso.value = localStorage.getItem('correcta-' + clave) || '';
    preguntasGuardadas.value = JSON.parse(localStorage.getItem('preguntas-guardadas-' + clave)) || [];
    correctas.value = parseInt(localStorage.getItem('correctas-' + clave), 10) || 0;
    mostrarMensajeFinal(clave);
    calcularTiempoRestante();
    setInterval(calcularTiempoRestante, 1000);
    respuestaSeleccionada.value = true;
    preguntaActual.value = 3;
  }
});
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

.intruso-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #670000, #0a0000);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
  font-family: 'Bebas Neue', sans-serif;
  animation: backgroundPulse 10s ease infinite alternate;
}

.titulo-juego {
  font-size: 2.5rem;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(255, 0, 0, 0.7);
}

.subtitulo-juego {
  font-size: 1.8rem;
  color: #ffcccc;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

/* Botones con bordes épicos */
.boton-opcion {
  width: 100%;
  padding: 1rem;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 12px;
  background: transparent;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.boton-opcion::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, #e70013, #ff0000, #e70013);
  opacity: 0.1;
  transition: all 0.4s ease;
  z-index: -1;
}
.boton-opcion:hover::before {
  left: 0;
  opacity: 0.3;
}
.boton-opcion:hover {
  transform: scale(1.05);
  border-color: #ff4d4d;
}

/* Resultado */
.correcta {
  background-color: rgba(0, 255, 0, 0.15);
  border-color: lime;
}
.incorrecta {
  background-color: rgba(255, 0, 0, 0.15);
  border-color: crimson;
}

/* Reloj */
.reloj {
  font-size: 2rem;
  font-weight: bold;
  color: #ffaaaa;
  text-shadow: 0 0 5px red;
}

/* Animaciones */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes backgroundPulse {
  0% { background-color: #670000; }
  100% { background-color: #2a0000; }
}
.animate-slide-in {
  animation: slideIn 1s ease forwards;
}
.animate-fade-in {
  animation: fadeIn 1.2s ease forwards;
}
</style>