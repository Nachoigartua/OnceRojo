<template>
  <div class="rodle-container text-white text-center px-3">
    <h2 class="titulo-juego mb-4 animate-slide-in">🟥 Rodle 🟥</h2>

    <div v-if="yaJugado">
      <p class="fs-5">Ya jugaste hoy. Volvé en:</p>
      <h3 class="reloj">{{ tiempoRestante }}</h3>
    </div>

    <div v-else-if="palabraDelDia">
      <p class="mb-3 fs-5">Adiviná el apellido del jugador 🔤</p>

      <div class="grilla">
        <div
          v-for="fila in 5"
          :key="fila"
          class="fila"
        >
          <div
            v-for="col in palabraDelDia.length"
            :key="col"
            class="letra"
            :class="getColor(fila - 1, col - 1)"
          >
            {{ getChar(fila - 1, col - 1) }}
          </div>
        </div>
      </div>

      <div v-if="juegoTerminado" class="mt-4">
        <p class="fs-5" :class="esCorrecto ? 'text-success' : 'text-danger'">
          {{ esCorrecto ? '✅ ¡Correcto!' : `❌ Era: ${palabraDelDia}` }}
        </p>
      </div>
    </div>

    <div v-else>
      <p class="text-warning">No hay Rodle cargado para hoy.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const intentos = ref([]) // cada intento validado (con color)
const palabraDelDia = ref('')
const juegoTerminado = ref(false)
const esCorrecto = ref(false)
const yaJugado = ref(false)
const tiempoRestante = ref('')

const intentoActual = ref([]) // letras del intento en curso

const obtenerFechaClave = () => {
  const ahora = new Date()
  ahora.setUTCHours(3, 0, 0, 0)
  return ahora.toISOString().slice(0, 10)
}

const calcularTiempoRestante = () => {
  const ahora = new Date()
  const mañana = new Date()
  mañana.setUTCHours(27, 0, 0, 0)
  const diff = mañana - ahora

  const horas = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0')
  const minutos = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0')
  const segundos = String(Math.floor((diff / 1000) % 60)).padStart(2, '0')

  tiempoRestante.value = `${horas}:${minutos}:${segundos}`
}

const colorearIntento = (intento, palabra) => {
  const resultado = []
  const usado = Array(palabra.length).fill(false)

  for (let i = 0; i < palabra.length; i++) {
    if (intento[i] === palabra[i]) {
      resultado.push({ char: intento[i], color: 'verde' })
      usado[i] = true
    } else {
      resultado.push(null)
    }
  }

  for (let i = 0; i < palabra.length; i++) {
    if (resultado[i]) continue
    const index = palabra.split('').findIndex((c, j) => c === intento[i] && !usado[j])
    if (index !== -1) {
      resultado[i] = { char: intento[i], color: 'naranja' }
      usado[index] = true
    } else {
      resultado[i] = { char: intento[i], color: 'gris' }
    }
  }

  return resultado
}

const intentarAdivinar = () => {
  const intentoStr = intentoActual.value.join('').toLowerCase()
  if (intentoStr.length !== palabraDelDia.value.length) return

  const resultado = colorearIntento(intentoStr, palabraDelDia.value)
  intentos.value.push(resultado)

  if (intentoStr === palabraDelDia.value) {
    esCorrecto.value = true
    juegoTerminado.value = true
    localStorage.setItem('rodle-jugado-' + obtenerFechaClave(), 'true')
  } else if (intentos.value.length >= 5) {
    juegoTerminado.value = true
    localStorage.setItem('rodle-jugado-' + obtenerFechaClave(), 'true')
  }

  intentoActual.value = []
}

const handleKey = (e) => {
  if (juegoTerminado.value) return

  const letra = e.key.toLowerCase()
  if (/^[a-zñáéíóúü]$/.test(letra) && intentoActual.value.length < palabraDelDia.value.length) {
    intentoActual.value.push(letra.normalize("NFD").replace(/[\u0300-\u036f]/g, ''))
  } else if (e.key === 'Backspace') {
    intentoActual.value.pop()
  } else if (e.key === 'Enter') {
    if (intentoActual.value.length === palabraDelDia.value.length) {
      intentarAdivinar()
    }
  }
}

const getColor = (fila, col) => {
  if (intentos.value[fila] && intentos.value[fila][col]) {
    return intentos.value[fila][col].color
  }
  return ''
}

const getChar = (fila, col) => {
  if (intentos.value[fila]) {
    return intentos.value[fila][col]?.char?.toUpperCase() || ''
  } else if (fila === intentos.value.length) {
    return intentoActual.value[col]?.toUpperCase() || ''
  }
  return ''
}

onMounted(async () => {
  const clave = obtenerFechaClave()
  yaJugado.value = localStorage.getItem('rodle-jugado-' + clave) === 'true'

  if (yaJugado.value) {
    calcularTiempoRestante()
    setInterval(calcularTiempoRestante, 1000)
  }

  try {
    const res = await fetch('/Rodle.json')
    const data = await res.json()
    if (data[clave]) {
      palabraDelDia.value = data[clave].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    }
  } catch (error) {
    console.error('Error cargando Rodle.json:', error)
  }

  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
})
</script>

<style scoped>
.rodle-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #670000, #0a0000);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
  font-family: 'Bebas Neue', sans-serif;
}

.titulo-juego {
  font-size: 2.5rem;
  color: #fff;
  text-shadow: 0 0 12px rgba(255, 0, 0, 0.7);
}

.reloj {
  font-size: 2rem;
  font-weight: bold;
  color: #ffaaaa;
  text-shadow: 0 0 5px red;
}

.grilla {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
}

.fila {
  display: flex;
  gap: 0.4rem;
}

.letra {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 5px;
  background-color: #222;
  color: white;
  border: 1px solid #555;
  text-transform: uppercase;
}

.verde {
  background-color: #4caf50;
}

.naranja {
  background-color: #ff9800;
}

.gris {
  background-color: #777;
}
</style>
