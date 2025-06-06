<template>
  <div class="adivina-el-gol-wrapper text-white">
    <!-- MENSAJE -->
    <div v-if="resultado" class="mensaje-superior">
      <p>{{ resultado }}</p>
    </div>

    <!-- VIDEO -->
    <div class="video-container">
      <video
        :src="videoSrc"
        ref="video"
        autoplay
        class="video"
        @timeupdate="detenerVideo"
        @ended="finalizarVideo"
        @pause="evitarPausa"
        @seeking="evitarAdelanto"
      >
        Tu navegador no soporta videos.
      </video>
    </div>

    <!-- RESPUESTAS -->
    <transition name="fade-slide">
      <div
        v-if="respuestas.length"
        class="respuestas-container"
      >
        <h2 class="titulo">
          {{ yaRespondio ? 'Ya respondiste hoy' : '¿Cómo terminó esta jugada?' }}
        </h2>
        <div v-for="(respuesta, index) in respuestas" :key="index">
          <button
            class="respuesta-btn"
          :class="{
  'correcta': mostrarResultadoVisual && respuesta === correctaDelDia,
  'incorrecta': mostrarResultadoVisual && respuesta === respuestaSeleccionada && respuesta !== correctaDelDia
}"

            :disabled="yaRespondio || respuestaSeleccionada !== null || !respuestasHabilitadas"
            @click="verificarRespuesta(respuesta)"
          >
            {{ respuesta }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerFechaArgentina, calcularTiempoHastaMedianocheArgentina } from '@/utils/horaArgentina';

const video = ref(null);
const contador = ref(0); // Contador de tiempo restante
const respuestas = ref([]);
const resultado = ref('');
const respuestaSeleccionada = ref(null);
const esCorrecta = ref(false);
const videoFinalizado = ref(false);
const respuestasHabilitadas = ref(false);
const tiempoAgotado = ref(false);
const videoSrc = ref('');
let correctaDelDia = '';
const mostrarResultadoVisual = ref(false);
const yaRespondio = ref(false); // Estado manejado en memoria
const tiempoRestante = ref('');

// Función para calcular el tiempo restante hasta las 00:00 (hora de Argentina)
const calcularTiempoRestante = () => {
  tiempoRestante.value = calcularTiempoHastaMedianocheArgentina();
};

// Función para guardar la respuesta en localStorage
const guardarRespuesta = () => {
const hoy = obtenerFechaArgentina(); // Asegurate de que esta función devuelva YYYY-MM-DD
  localStorage.setItem(`gol-respondido-${hoy}`, 'true');
  localStorage.setItem(`gol-respuesta-${hoy}`, respuestaSeleccionada.value);
};

// Función para cargar el estado desde localStorage
const cargarEstado = () => {
const hoy = obtenerFechaArgentina(); // Asegurate de que esta función devuelva YYYY-MM-DD
  const respondido = localStorage.getItem(`gol-respondido-${hoy}`);
  const respuesta = localStorage.getItem(`gol-respuesta-${hoy}`);

  if (respondido === 'true') {
    yaRespondio.value = true;
    respuestaSeleccionada.value = respuesta;
    calcularTiempoRestante();
    resultado.value = `Ya respondiste hoy. Volvé a intentarlo en ${tiempoRestante.value}`;
  }
};

// Cargar datos del JSON al montar el componente
onMounted(async () => {
  cargarEstado(); // Cargar el estado desde localStorage
  calcularTiempoRestante();
  const hoy = obtenerFechaArgentina();
  const fallback = '2025-05-04';
  try {
    const data = await fetch(`${import.meta.env.BASE_URL}contenido_diario.json`).then((res) => res.json());
    const key = data[hoy] ? hoy : fallback;
    if (data[key]) {
      videoSrc.value = `${import.meta.env.BASE_URL}videos/${data[key].video}`;
      respuestas.value = data[key].respuestas;
      correctaDelDia = data[key].correcta;
    } else {
      resultado.value = '📅 No hay contenido cargado para hoy.';
    }
  } catch (error) {
    console.error('Error al cargar el archivo JSON:', error);
    resultado.value = '❌ Error al cargar el contenido.';
  }
});

// Detener el video en un momento específico
const detenerVideo = () => {
  if (video.value.currentTime >= 9 && !respuestasHabilitadas.value && !yaRespondio.value) {
    video.value.pause(); // Pausa el video
    respuestasHabilitadas.value = true; // Habilita las respuestas
    iniciarContador(); // Inicia el contador para responder
  }
};

// Iniciar un contador de tiempo para responder
const iniciarContador = () => {
  contador.value = 15; // Inicializa el contador en 15 segundos
  tiempoAgotado.value = false;
  const intervalo = setInterval(() => {
    contador.value--;
    if (contador.value <= 0) {
      clearInterval(intervalo);
      tiempoAgotado.value = true;
      respuestasHabilitadas.value = false;
      resultado.value = '⏰ Se acabó el tiempo. Volvé a intentarlo mañana.';
    }
  }, 1000);
};

// Verificar la respuesta seleccionada
const verificarRespuesta = (respuesta) => {
  if (tiempoAgotado.value || yaRespondio.value) return;

  respuestaSeleccionada.value = respuesta;
  yaRespondio.value = true;
  guardarRespuesta();

  // Reanudar el video inmediatamente
  if (!tiempoAgotado.value) {
    video.value.play();
  }

  // Mostrar resultado visual tras 3 segundos
  setTimeout(() => {
    mostrarResultadoVisual.value = true;
    esCorrecta.value = respuesta === correctaDelDia;
    resultado.value = esCorrecta.value
      ? '✅ ¡Correcto!'
      : `❌ Incorrecto. Era: ${correctaDelDia}`;
    videoFinalizado.value = true;
  }, 3000);
};



// Finalizar el video
const finalizarVideo = () => {
  videoFinalizado.value = true;
};
</script>

<style scoped>
.adivina-el-gol-wrapper {
  display: flex;
  flex-direction: row; /* para que el video y las respuestas estén uno al lado del otro */
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #b30000, #1a0000);
  min-height: 100vh;
  padding: 2rem;
  flex-wrap: wrap; /* para que sea responsivo en pantallas pequeñas */
  gap: 2rem; /* espacio entre video y respuestas */
}


.mensaje-superior {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  z-index: 10;
}

.video-container {
  max-width: 800px;
  flex: 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.video {
  width: 100%;
  border-radius: 20px;
}

.respuestas-container {
  flex: 1;
  max-width: 400px;
  background: #1a0000;
  border: 2px solid #ff4d4d;
  padding: 2rem;
  border-radius: 20px;
  animation: pop-in 0.6s ease;
}

.titulo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.respuesta-btn {
  width: 100%;
  margin-bottom: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #ffffff;
  color: #a00000;
  border: 2px solid #ffffff;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.respuesta-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(255, 0, 0, 0.3);
}

.respuesta-btn.correcta {
  background-color: #28a745;
  color: #fff;
}

.respuesta-btn.incorrecta {
  background-color: #dc3545;
  color: #fff;
}

.resultado {
  margin-top: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 1rem 2rem;
  border-radius: 12px;
  animation: fade-pop 0.5s ease;
}
</style>