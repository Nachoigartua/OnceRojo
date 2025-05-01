<template>
  <div class="adivina-el-gol-wrapper text-white">
    <!-- VIDEO -->
    <div class="video-container">
      <video
        :src="`/videos/${videoSrc}`"
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
        v-if="respuestas.length && !yaRespondio"
        class="respuestas-container"
      >
        <h2 class="titulo">⚽ ¿Cómo terminó esta jugada?</h2>
        <div v-for="(respuesta, index) in respuestas" :key="index">
          <button
            class="respuesta-btn"
            :class="{
              'correcta': respuesta === respuestaSeleccionada && esCorrecta && videoFinalizado,
              'incorrecta': respuesta === respuestaSeleccionada && !esCorrecta && videoFinalizado
            }"
            :disabled="respuestaSeleccionada !== null || !respuestasHabilitadas"
            @click="verificarRespuesta(respuesta)"
          >
            {{ respuesta }}
          </button>
        </div>
      </div>
    </transition>

    <!-- MENSAJE -->
    <transition name="fade-pop">
      <div v-if="resultado" class="resultado">
        <p>{{ resultado }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const video = ref(null)
const contador = ref(0)
const respuestas = ref([])
const resultado = ref('')
const respuestaSeleccionada = ref(null)
const esCorrecta = ref(false)
const videoFinalizado = ref(false)
const respuestasHabilitadas = ref(false)
const mostrarSugerencia = ref(false)
const tiempoAgotado = ref(false)
const videoSrc = ref('')
let correctaDelDia = ''

const yaRespondio = ref(false)
const tiempoRestante = ref('')

const calcularTiempoRestante = () => {
  const ahora = new Date()
  const proximaMedianoche = new Date(ahora)
  proximaMedianoche.setHours(24, 0, 0, 0)
  const diferencia = proximaMedianoche - ahora
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))
  tiempoRestante.value = `${horas}h ${minutos}m`
}

const verificarRespuestaGuardada = () => {
  const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
    .toISOString()
    .slice(0, 10)
  const respuestaGuardada = localStorage.getItem(`gol-respondido-${hoy}`)
  if (respuestaGuardada) {
    yaRespondio.value = true
    calcularTiempoRestante()
    resultado.value = 'Ya respondiste hoy. Volvé a intentarlo en ' + tiempoRestante.value
  }
}

const guardarRespuesta = () => {
  const hoy = new Date().toISOString().slice(0, 10)
  localStorage.setItem(`gol-respondido-${hoy}`, 'respondido')
  yaRespondio.value = true
  calcularTiempoRestante()
}

onMounted(async () => {
  const hoy = new Date().toISOString().slice(0, 10)
  verificarRespuestaGuardada()

  const data = await fetch('/contenido_diario.json').then(res => res.json())

  if (data[hoy]) {
    videoSrc.value = data[hoy].video
    respuestas.value = data[hoy].respuestas
    correctaDelDia = data[hoy].correcta
  } else {
    resultado.value = '📅 No hay contenido cargado para hoy.'
  }
})

const detenerVideo = () => {
  if (video.value.currentTime >= 9 && contador.value === 0 && !yaRespondio.value) {
    video.value.pause()
    respuestasHabilitadas.value = true
    iniciarContador()
  }
}

const iniciarContador = () => {
  contador.value = 15
  tiempoAgotado.value = false
  const intervalo = setInterval(() => {
    contador.value--
    if (contador.value <= 0) {
      clearInterval(intervalo)
      tiempoAgotado.value = true
      respuestasHabilitadas.value = false
      resultado.value = '⏰ Se acabó el tiempo. Volvé a intentarlo mañana.'
      video.value.play()
    }
  }, 1000)
}

const verificarRespuesta = (respuesta) => {
  if (tiempoAgotado.value || yaRespondio.value) return

  respuestaSeleccionada.value = respuesta
  guardarRespuesta()

  setTimeout(() => {
    esCorrecta.value = respuesta === correctaDelDia
    resultado.value = esCorrecta.value ? '✅ ¡Correcto!' : `❌ Incorrecto. Era: ${correctaDelDia}`
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
  display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: center;
flex-wrap: wrap;
gap: 2rem;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #b30000, #1a0000);
  min-height: 100vh;
  padding: 2rem;
}

.video-container {
  max-width: 800px;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
}

.video {
  width: 100%;
  border-radius: 20px;
}

.respuestas-container {
  background: #1a0000;
  border: 2px solid #ff4d4d;
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
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
  background-color: rgba(0,0,0,0.6);
  padding: 1rem 2rem;
  border-radius: 12px;
  animation: fade-pop 0.5s ease;
}

@keyframes pop-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-slide-enter-active {
  animation: fade-slide-in 0.6s ease forwards;
}

@keyframes fade-slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-pop-enter-active {
  animation: fade-pop 0.5s ease forwards;
}

@keyframes fade-pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
