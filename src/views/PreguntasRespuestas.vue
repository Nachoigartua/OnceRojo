<template>
  <div class="preguntas-respuestas-wrapper text-white">
    <h1 class="titulo mb-4">❓ Preguntas y Respuestas</h1>

    <!-- Mensaje de "Ya jugaste hoy" -->
    <div v-if="yaJugado" class="text-center">
      <h2 class="text-warning">Vuelve a intentarlo en {{ tiempoRestante }}</h2>
      <div class="mt-4">
        <h3 class="pregunta">Última pregunta:</h3>
        <p class="mb-3">{{ ultimaPregunta?.pregunta }}</p>
        <button
          class="btn btn-light opcion-btn"
          :class="{
            'bg-success text-white': ultimaRespuesta === ultimaPregunta?.respuesta_correcta,
            'bg-danger text-white': ultimaRespuesta !== ultimaPregunta?.respuesta_correcta
          }"
          disabled
        >
          {{ ultimaRespuesta }}
        </button>
        <p class="mt-3" :class="ultimaRespuesta === ultimaPregunta?.respuesta_correcta ? 'text-success' : 'text-danger'">
          {{ ultimaRespuesta === ultimaPregunta?.respuesta_correcta ? '✅ Correcto' : `❌ Incorrecto. La respuesta correcta era: ${ultimaPregunta?.respuesta_correcta}` }}
        </p>
      </div>
    </div>

    <!-- Mensaje de resultado final -->
    <div v-else-if="juegoTerminado" class="resultado-final">
      <h2 :class="esGanador ? 'text-success' : 'text-danger'">
        {{ esGanador ? '🎉 ¡Ganaste!' : '❌ Perdiste' }}
      </h2>
      <p v-if="esGanador">¡Respondiste correctamente las 3 preguntas!</p>
      <p v-else>Intenta nuevamente mañana para ganar.</p>
    </div>

    <!-- Pregunta actual -->
    <div v-else>
      <h2 class="pregunta mb-4">{{ preguntaActual?.pregunta }}</h2>

      <!-- Opciones -->
      <div class="opciones-container">
        <button
          v-for="(opcion, index) in preguntaActual?.posibles_respuestas"
          :key="index"
          class="btn btn-light opcion-btn"
          @click="verificarRespuesta(opcion)"
        >
          {{ opcion }}
        </button>
      </div>

      <!-- Contador -->
      <div class="contador mt-4">
        <p>⏳ Tiempo restante: <span class="text-warning">{{ contador }}</span> segundos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const todasLasPreguntas = ref([]);
const preguntas = ref([]);
const preguntaActual = ref(null);
const indicePregunta = ref(0);
const contador = ref(10);
const juegoTerminado = ref(false);
const esGanador = ref(false);
const respuestasCorrectas = ref(0);
const botonesDeshabilitados = ref(false);
const yaJugado = ref(false);
const tiempoRestante = ref('');
const ultimaPregunta = ref(null);
const ultimaRespuesta = ref('');
const errorCarga = ref(false);
let intervalo = null;

// Función para obtener la fecha clave (YYYY-MM-DD)
const obtenerFechaClave = () => {
  const ahora = new Date();
  ahora.setUTCHours(3, 0, 0, 0); // Ajuste para UTC-3
  return ahora.toISOString().slice(0, 10);
};

// Función para calcular el tiempo restante hasta las 00:00 (hora de Argentina)
const calcularTiempoRestante = () => {
  const ahora = new Date();
  const mañana = new Date();
  mañana.setUTCHours(27, 0, 0, 0); // Mañana a las 00:00 (UTC-3)
  const diff = mañana - ahora;

  const horas = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
  const minutos = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const segundos = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  tiempoRestante.value = `${horas}:${minutos}:${segundos}`;
};

// Cargar preguntas del JSON y elegir 3 aleatorias
const cargarPreguntas = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}ruleta_rapida_independiente_10dias.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Filtrar preguntas que tengan pregunta, respuesta y opciones
    const todas = data.flat().filter(p =>
      p.pregunta && p.respuesta_correcta && Array.isArray(p.posibles_respuestas) && p.posibles_respuestas.length >= 2
    );

    if (todas.length < 3) {
      throw new Error('No hay suficientes preguntas válidas.');
    }

    todasLasPreguntas.value = todas;
    errorCarga.value = false;
    seleccionarPreguntasAleatorias();
  } catch (error) {
    console.error('Error al cargar las preguntas:', error);
    errorCarga.value = true;
  }
};

const seleccionarPreguntasAleatorias = () => {
  const mezcladas = [...todasLasPreguntas.value].sort(() => 0.5 - Math.random());
  preguntas.value = mezcladas.slice(0, 3);
  indicePregunta.value = 0;
  respuestasCorrectas.value = 0;
  juegoTerminado.value = false;
  cargarPregunta();
};

const cargarPregunta = () => {
  preguntaActual.value = preguntas.value[indicePregunta.value];
  botonesDeshabilitados.value = false;
  nextTick(() => {
    const botones = document.querySelectorAll('.opcion-btn');
    botones.forEach(btn => {
      btn.classList.remove('bg-success', 'bg-danger', 'text-white');
    });
  });
  iniciarContador();
};

const verificarRespuesta = async (opcion) => {
  if (botonesDeshabilitados.value) return;
  botonesDeshabilitados.value = true;
  detenerContador();

  const botones = document.querySelectorAll('.opcion-btn');

  botones.forEach(btn => {
    const texto = btn.innerText.trim();
    if (texto === preguntaActual.value.respuesta_correcta) {
      btn.classList.add('bg-success', 'text-white');
    } else if (texto === opcion) {
      btn.classList.add('bg-danger', 'text-white');
    }
  });

  await delay(1500);

  if (opcion === preguntaActual.value.respuesta_correcta) {
    respuestasCorrectas.value++;
    if (indicePregunta.value < 2) {
      indicePregunta.value++;
      cargarPregunta();
    } else {
      terminarJuego();
    }
  } else {
    terminarJuego();
  }

  // Guardar la última pregunta y respuesta en localStorage
  const clave = obtenerFechaClave();
  localStorage.setItem('pregunta-jugada-' + clave, JSON.stringify(preguntaActual.value));
  localStorage.setItem('respuesta-jugada-' + clave, opcion);
};

const iniciarContador = () => {
  contador.value = 10;
  intervalo = setInterval(() => {
    contador.value--;
    if (contador.value <= 0) {
      detenerContador();
      terminarJuego();
    }
  }, 1000);
};

const detenerContador = () => {
  clearInterval(intervalo);
};

const terminarJuego = () => {
  detenerContador();
  juegoTerminado.value = true;
  esGanador.value = respuestasCorrectas.value === 3;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Verificar si el usuario ya jugó hoy
const verificarSiYaJugo = () => {
  const clave = obtenerFechaClave();
  yaJugado.value = localStorage.getItem('pregunta-jugada-' + clave) !== null;

  if (yaJugado.value) {
    ultimaPregunta.value = JSON.parse(localStorage.getItem('pregunta-jugada-' + clave));
    ultimaRespuesta.value = localStorage.getItem('respuesta-jugada-' + clave);
    calcularTiempoRestante();
    setInterval(calcularTiempoRestante, 1000);
  } else {
    cargarPreguntas();
  }
};

onMounted(() => {
  verificarSiYaJugo();
});
</script>

<style scoped>
.preguntas-respuestas-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at center, #b30000, #1a0000);
  padding: 2rem;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.pregunta {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.opciones-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra los botones horizontalmente */
  gap: 1rem;
  width: 100%;
}

.opcion-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.opcion-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.3);
}

.contador {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.resultado-final {
  text-align: center;
}

.resultado-final h2 {
  font-size: 2rem;
  font-weight: bold;
}

.resultado-final p {
  font-size: 1.2rem;
  margin-top: 1rem;
}
</style>