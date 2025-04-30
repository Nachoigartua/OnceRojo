<template>
  <div class="adivina-el-gol-wrapper text-white text-center min-vh-100 d-flex flex-column align-items-center justify-content-start px-3" style="background: radial-gradient(circle, #e70013 30%, #a0000f 100%)">
    <div class="boton-inicio">
      <router-link to="/" class="btn-inicio">RojoFut25</router-link>
    </div>
    <h2 class="mb-4">⚽ Adivina el Gol</h2>
    <!-- Video MP4 -->
    <div class="video-container mb-4">
      <video
        ref="video"
        autoplay
        class="video"
        @timeupdate="detenerVideo"
        @ended="finalizarVideo"
        @pause="evitarPausa"
      >
        <source src="C:\Users\ignac\Videos\Perez.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>
    </div>
    <!-- Mensaje de sugerencia -->
    <div v-if="mostrarSugerencia" class="scroll-suggestion">
      <p>desplazate hacia abajo ⬇️</p>
    </div>
    <div v-if="contador > 0" class="contador">
      <p>Tiempo restante: {{ contador }} segundos</p>
    </div>
    <div class="multiple-choice">
      <p class="mb-4">¿Cómo terminó esta jugada?</p>
      <div class="row">
        <div
          class="col-6"
          v-for="(respuesta, index) in respuestas"
          :key="index"
        >
          <button
            class="custom-btn w-100 mb-3"
            :class="{
              'btn-success': respuesta === respuestaSeleccionada && esCorrecta && videoFinalizado,
              'btn-danger': respuesta === respuestaSeleccionada && !esCorrecta && videoFinalizado
            }"
            :disabled="respuestaSeleccionada !== null || !respuestasHabilitadas"
            @click="verificarRespuesta(respuesta)"
          >
            {{ respuesta }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="resultado" class="resultado-modal">
      <p>{{ resultado }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const video = ref(null)
const contador = ref(0)
const respuestas = [
  'La abre al lateral',
  'Dispara al arco y va al saque de arco',
  'Dispara al arco y es gol',
  'Termina en gol en contra'
]
const resultado = ref('')
const respuestaSeleccionada = ref(null)
const esCorrecta = ref(false)
const videoFinalizado = ref(false)
const respuestasHabilitadas = ref(false)
const mostrarSugerencia = ref(false)
const tiempoAgotado = ref(false) // 🆕 NUEVO estado para manejar el timeout
let intervalo = null

const detenerVideo = () => {
  if (video.value.currentTime >= 9 && contador.value === 0) {
    video.value.pause()
    respuestasHabilitadas.value = true
    mostrarSugerencia.value = true
    iniciarContador()
  }
}

const iniciarContador = () => {
  contador.value = 15
  tiempoAgotado.value = false
  intervalo = setInterval(() => {
    contador.value--
    if (contador.value <= 0) {
      clearInterval(intervalo)
      tiempoAgotado.value = true
      respuestasHabilitadas.value = false
      resultado.value = '⏰ Debes seleccionar una respuesta para ver la jugada completa. Inténtalo nuevamente.'
      video.value.play()
    }
  }, 1000)
}

const verificarRespuesta = (respuesta) => {
  // Si el tiempo ya se agotó, no permitir responder
  if (tiempoAgotado.value) return

  clearInterval(intervalo)
  respuestaSeleccionada.value = respuesta

  setTimeout(() => {
    if (respuesta === 'Dispara al arco y va al saque de arco') {
      esCorrecta.value = true
      resultado.value = '¡Correcto!'
    } else {
      esCorrecta.value = false
      resultado.value = '¡Incorrecto! Intenta nuevamente.'
    }
    videoFinalizado.value = true
  }, 3000)

  setTimeout(() => {
    video.value.play()
  }, 1000)
}

const finalizarVideo = () => {
  videoFinalizado.value = true
}
</script>


<style scoped>
.adivina-el-gol-wrapper {
  padding: -4rem;
}

.video-container {
  max-width: 700px;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-top: 0px; /* o 0 si quieres que esté completamente pegado arriba */
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.video {
  width: 100%;
  height: auto;
  border: none;
}

.scroll-suggestion {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  animation: fadeInOut 2s infinite;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.multiple-choice p {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  border: none;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.col-6 {
  flex: 0 0 calc(50% - 1rem);
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
.boton-inicio {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.btn-inicio {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s ease;
}

.btn-inicio:hover {
  color: #ffcccc;
}


.resultado-modal {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
}

.contador {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>