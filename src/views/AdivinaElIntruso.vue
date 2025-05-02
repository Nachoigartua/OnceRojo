<template>
  <div class="intruso-container text-white text-center px-3">
    <h2 class="titulo-juego mb-5 animate-slide-in">🔎 Adiviná el Intruso 🔎</h2>

    <!-- Mensaje de "Ya respondiste hoy" -->
    <div v-if="yaJugado">
      <p class="fs-5">Ya has respondido hoy.</p>
      <h3 class="reloj">Vuelve a intentarlo en: {{ tiempoRestante }}</h3>
      <p class="mb-4 fs-5 animate-fade-in">{{ preguntaGuardada }}</p> <!-- Show stored question -->
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
    <div v-else-if="opciones.length">
      <p class="mb-4 fs-5 animate-fade-in">{{ pregunta }}</p> <!-- Show current question -->
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
      </div>
    </div>

    <!-- Mensaje de "No hay desafío cargado" -->
    <div v-else>
      <p class="text-warning">No hay desafío cargado para hoy.</p>
    </div>
  </div>
</template>

<<script setup>
import { ref, onMounted } from 'vue';

const opciones = ref([]); // Opciones del día
const intruso = ref(''); // El intruso (respuesta correcta)
const pregunta = ref('¿Quién no jugó en el Rey de Copas?');
const preguntaGuardada = ref('');
const respuestaSeleccionada = ref(false);
const esCorrecta = ref(false);
const mensajeResultado = ref('');
const yaJugado = ref(false);
const tiempoRestante = ref('');
const respuestaGuardada = ref('');

// Obtener fecha clave en formato YYYY-MM-DD (con ajuste a UTC-3)
const obtenerFechaClave = () => {
  const ahora = new Date();
  ahora.setUTCHours(3, 0, 0, 0); // UTC-3 fijo
  return ahora.toISOString().slice(0, 10);
};

// Calcular tiempo hasta las 00:00 del día siguiente en horario de Argentina
const calcularTiempoRestante = () => {
  const ahora = new Date();
  const mañana = new Date();
  mañana.setUTCHours(27, 0, 0, 0); // 00:00 de Argentina del día siguiente
  const diff = mañana - ahora;

  const horas = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
  const minutos = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const segundos = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  tiempoRestante.value = `${horas}:${minutos}:${segundos}`;
};

// Verificar la respuesta
const verificarRespuesta = (opcion) => {
  respuestaSeleccionada.value = true;
  esCorrecta.value = opcion === intruso.value;
  mensajeResultado.value = esCorrecta.value
    ? '✅ ¡Correcto!'
    : `❌ Incorrecto. El intruso era: ${intruso.value}`;

  const clave = obtenerFechaClave();
  localStorage.setItem('respuesta-' + clave, 'true');
  localStorage.setItem('seleccionada-' + clave, opcion);
  localStorage.setItem('correcta-' + clave, intruso.value);
  localStorage.setItem('pregunta-' + clave, pregunta.value);
};

// Cargar el desafío del día desde el JSON
const cargarDatosDelDia = async () => {
  const clave = obtenerFechaClave();
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}adivina-intruso.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const entradaHoy = data[clave];

    if (entradaHoy) {
      opciones.value = entradaHoy.opciones;
      intruso.value = entradaHoy.intruso;
      pregunta.value = entradaHoy.pregunta || pregunta.value;
    } else {
      console.warn('No hay desafío cargado para hoy.');
    }
  } catch (error) {
    console.error('Error cargando el JSON:', error);
  }
};

// Al montar el componente
onMounted(async () => {
  const clave = obtenerFechaClave();
  yaJugado.value = localStorage.getItem('respuesta-' + clave) === 'true';

  // Siempre cargamos los datos del día para tener las opciones visibles
  await cargarDatosDelDia();

  if (yaJugado.value) {
    respuestaGuardada.value = localStorage.getItem('seleccionada-' + clave) || '';
    intruso.value = localStorage.getItem('correcta-' + clave) || '';
    preguntaGuardada.value = localStorage.getItem('pregunta-' + clave) || pregunta.value;
    calcularTiempoRestante();
    setInterval(calcularTiempoRestante, 1000);
    respuestaSeleccionada.value = true; // mostrar resultado en el template
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