<template>
  <div class="adivina-el-gol-wrapper d-flex min-vh-100 text-white position-relative" style="background-color: #e70013">
    
    <!-- BOTÓN DE INICIO ARRIBA A LA IZQUIERDA -->
 


    <!-- VIDEO IZQUIERDA -->
    <div class="video-container flex-grow-1 d-flex justify-content-center align-items-center p-4">
      <video
        :src="`/videos/${videoSrc}`"
        ref="video"
        autoplay
        class="video rounded"
        @timeupdate="detenerVideo"
        @ended="finalizarVideo"
        @pause="evitarPausa"
        controls
        style="max-width: 100%; height: auto;"
      >
        Tu navegador no soporta videos.
      </video>
    </div>

    <!-- RESPUESTAS DERECHA -->
    <div class="respuestas-container p-4 d-flex flex-column justify-content-center align-items-center" style="width: 40%; background-color: #a0000f; border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;">
      <h4 class="mb-4 text-white text-center">¿Cómo terminó esta jugada?</h4>
      <div class="w-100">
        <div
          class="mb-3"
          v-for="(respuesta, index) in respuestas"
          :key="index"
        >
          <button
            class="btn btn-light w-100"
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

      <div v-if="resultado" class="mt-4 text-white text-center">
        <p>{{ resultado }}</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'

const video = ref(null)
const contador = ref(0)
const respuestas = ref([]) // ✅ Cambiado de const a ref
const resultado = ref('')
const respuestaSeleccionada = ref(null)
const esCorrecta = ref(false)
const videoFinalizado = ref(false)
const respuestasHabilitadas = ref(false)
const mostrarSugerencia = ref(false)
const tiempoAgotado = ref(false) // ✅ Nueva bandera
let intervalo = null
const videoSrc = ref('')
let correctaDelDia = ''

onMounted(async () => {
  const hoy = new Date().toISOString().slice(0, 10)
  const data = await fetch('/contenido_diario.json').then(res => res.json())

  if (data[hoy]) {
    videoSrc.value = data[hoy].video
    respuestas.value = data[hoy].respuestas // ✅ se puede asignar dinámicamente
    correctaDelDia = data[hoy].correcta
  } else {
    resultado.value = '📅 No hay contenido cargado para hoy.'
  }
})

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
      tiempoAgotado.value = true // ✅ Marcamos que se agotó el tiempo
      respuestasHabilitadas.value = false
      resultado.value = '⏰ Debes seleccionar una respuesta para ver la jugada completa. Inténtalo nuevamente.'
      video.value.play()
    }
  }, 1000)
}

const verificarRespuesta = (respuesta) => {
  // ✅ Si el tiempo se agotó, no permitir responder
  if (tiempoAgotado.value) return

  clearInterval(intervalo)
  respuestaSeleccionada.value = respuesta

  setTimeout(() => {
    if (respuesta === correctaDelDia) {
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
/* (sin cambios en el style) */
.adivina-el-gol-wrapper {
  padding: -4rem;
}

.video-container {
  max-width: 700px;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-top: 0px;
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
.video {
  width: 100%;
  max-height: 80vh;
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
