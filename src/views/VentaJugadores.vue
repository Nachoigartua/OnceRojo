<template>
  <div class="jugadores-wrapper d-flex flex-column align-items-center min-vh-100 text-white p-4">
    <h1 class="titulo mb-5 text-center">🏆 Top Ventas de Jugadores</h1>

  <div
  v-if="jugadoresColocados.some((slot) => slot !== null) || !juegoJugado"
  class="contenedor-principal d-flex align-items-center w-100"
  :class="{ 'centrado-final': jugadoresColocados.every((slot) => slot !== null) }"
>
      <!-- Pirámide de slots -->
      <div
        class="piramide-container"
        :class="{ 'centrar-piramide': jugadoresColocados.every((slot) => slot !== null) }"
      >
        <div
          v-for="(fila, filaIndex) in piramide"
          :key="filaIndex"
          class="fila d-flex justify-content-center mb-3"
        >
          <div
            v-for="(jugador, index) in fila"
            :key="index"
            class="slot-jugador d-flex align-items-center justify-content-center bg-secondary rounded position-relative"
            :style="getSlotStyle(filaIndex)"
            draggable="true"
            @dragstart="arrastrarDesdeSlot(jugador.index)"
            @dragover.prevent
            @drop="soltarEnSlot(jugador.index)"
          >
            <span class="posicion-numero">{{ jugador.index + 1 }}</span>
            <div class="info-jugador text-center">
              <div v-if="jugadoresColocados[jugador.index]">
                <strong>{{ jugadoresColocados[jugador.index].nombre }}</strong><br />
                <span v-if="juegoTerminado">💰 ${{ jugadoresColocados[jugador.index].coste }}M</span>
              </div>
            </div>
            <img
              v-if="jugadoresColocados[jugador.index]"
              :src="getImagenUrl(jugadoresColocados[jugador.index].imagen)"
              :alt="jugadoresColocados[jugador.index].nombre"
              class="img-fluid rounded"
              style="height: 60px; width: 70px; object-fit: contain;"
            />
          </div>
        </div>
      </div>

      <!-- Jugador actual -->
      <div
        v-if="jugadorActual"
        class="jugador-actual p-3 bg-white text-dark rounded shadow text-center animate-bounce"
        draggable="true"
        @dragstart="arrastrarJugadorActual"
        style="width: 200px;"
      >
        <img
          :src="getImagenUrl(jugadorActual.imagen)"
          :alt="jugadorActual.nombre"
          class="img-fluid rounded mb-2"
          style="max-height: 100px; object-fit: contain;"
        />
        <h6 class="mb-1">{{ jugadorActual.nombre }}</h6>
        <p class="mb-0" v-if="juegoTerminado">💰 ${{ jugadorActual.coste }}M</p>
      </div>
    </div>

    <div v-else class="text-center">
      <h3>🎮 Ya jugaste hoy</h3>
      <p>Vuelve a jugar en {{ tiempoRestante }}</p>
      <div class="plantilla-entregada mt-4">
        <div class="piramide-container">
          <div
            v-for="(fila, filaIndex) in piramide"
            :key="filaIndex"
            class="fila d-flex justify-content-center mb-3"
          >
            <div
              v-for="(slot, index) in fila"
              :key="index"
              class="slot-jugador d-flex align-items-center justify-content-center bg-secondary rounded position-relative"
              :style="getSlotStyle(filaIndex)"
            >
              <span class="posicion-numero">{{ slot.index + 1 }}</span>
              <div class="info-jugador text-center">
                <div v-if="plantillaEntregada[slot.index]">
                  <strong>{{ plantillaEntregada[slot.index].nombre }}</strong><br />
                  <span>💰 ${{ plantillaEntregada[slot.index].coste }}M</span>
                </div>
              </div>
              <img
                v-if="plantillaEntregada[slot.index]"
                :src="getImagenUrl(plantillaEntregada[slot.index].imagen)"
                :alt="plantillaEntregada[slot.index].nombre"
                class="img-fluid rounded"
                style="height: 60px; width: 70px; object-fit: contain;"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vidas restantes -->
    <div class="vidas mt-4" v-if="!juegoJugado">
      <div class="vidas-container d-flex justify-content-center">
        <img
          v-for="n in 5"
          :key="n"
          :class="['escudo-vida', { 'escudo-perdido': n > vidas, 'temblor': escudosTemblando }]"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg/973px-Escudo_del_Club_Atl%C3%A9tico_Independiente.svg.png"
          alt="vida"
        />
      </div>
    </div>

    <!-- Botón Enviar -->
    <button
      v-if="!juegoJugado"
      class="btn btn-light mt -1"
      @click="verificarOrden"
      :disabled="vidas === 0 || jugadoresColocados.includes(null)"
    >
      Enviar
    </button>

    <!-- Mensaje de resultado -->
    <div v-if="resultado" class="resultado mt-4 p-3 rounded text-center" :class="resultadoClase">
      <h3>{{ resultado }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerFechaArgentina, calcularTiempoHastaMedianocheArgentina } from '@/utils/horaArgentina';

const jugadores = ref([]);
const jugadoresReferencia = ref([]);
const jugadorActual = ref(null);
const jugadoresColocados = ref(Array(10).fill(null));
const origenDrag = ref(null);
const resultado = ref('');
const resultadoClase = ref('');
const vidas = ref(5);
const juegoTerminado = ref(false);
const juegoJugado = ref(false);
const tiempoRestante = ref('');
const plantillaEntregada = ref([]);
const escudosTemblando = ref(false);

const piramide = [
  [{ index: 0 }],
  [{ index: 1 }, { index: 2 }],
  [{ index: 3 }, { index: 4 }, { index: 5 }],
  [{ index: 6 }, { index: 7 }, { index: 8 }, { index: 9 }],
];

const getSlotStyle = (filaIndex) => {
  const width = 160 - filaIndex * 10;
  return {
    width: `${width}px`,
    height: '70px',
    margin: '0 5px',
  };
};

const getImagenUrl = (path) => {
  const url = `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
  console.debug('🔍 Image URL:', url); // Debugging image URL
  return url;
};

function calcularTiempoRestante() {
  tiempoRestante.value = calcularTiempoHastaMedianocheArgentina();
}

onMounted(async () => {
  const hoy = obtenerFechaArgentina();
  const jugado = localStorage.getItem('topVentasJugado') === hoy;

  if (jugado) {
    juegoJugado.value = true;
    calcularTiempoRestante();
    const plantillaGuardada = localStorage.getItem('plantillaEntregada');
    if (plantillaGuardada) {
      plantillaEntregada.value = JSON.parse(plantillaGuardada);
    }
    return;
  }

  try {
    const data = await fetch(`${import.meta.env.BASE_URL}jugadores_ventas.json`).then((res) =>
      res.json()
    );
    console.debug('🔍 JSON Data:', data); // Debugging JSON data

   if (data[hoy]) {
  jugadoresReferencia.value = data[hoy][0].jugadores;
  jugadores.value = [...jugadoresReferencia.value];
  jugadorActual.value = jugadores.value.shift(); // 👉 Esto faltaba
  console.debug('🔍 Players for today:', jugadores.value);
} else {
      console.error('❌ No hay datos para la fecha actual:', hoy);
    }
  } catch (error) {
    console.error('❌ Error al cargar jugadores:', error);
  }
});

const arrastrarJugadorActual = (event) => {
  origenDrag.value = null;
  event.dataTransfer.setData('text/plain', JSON.stringify(jugadorActual.value));
};

const arrastrarDesdeSlot = (index) => {
  const jugador = jugadoresColocados.value[index];
  if (!jugador) return;
  origenDrag.value = index;
  event.dataTransfer.setData('text/plain', JSON.stringify(jugador));
};

const soltarEnSlot = (destinoIndex) => {
  const jugadorSoltado = JSON.parse(event.dataTransfer.getData('text/plain'));

  if (origenDrag.value === null) {
    const reemplazo = jugadoresColocados.value[destinoIndex];
    jugadoresColocados.value[destinoIndex] = jugadorActual.value;
    jugadorActual.value = reemplazo || (jugadores.value.length > 0 ? jugadores.value.shift() : null);
  } else {
    const temp = jugadoresColocados.value[destinoIndex];
    jugadoresColocados.value[destinoIndex] = jugadoresColocados.value[origenDrag.value];
    jugadoresColocados.value[origenDrag.value] = temp;
    origenDrag.value = null;
  }
};

const activarTemblor = () => {
  escudosTemblando.value = false;
  void document.body.offsetWidth; // Trigger reflow
  escudosTemblando.value = true;

  setTimeout(() => {
    escudosTemblando.value = false;
  }, 500);
};

const verificarOrden = () => {
  let correctos = 0;

  jugadoresColocados.value.forEach((jugador, index) => {
    if (jugador && jugador.coste === jugadoresReferencia.value[index]?.coste) {
      correctos++;
    }
  });

  vidas.value--;
  activarTemblor(); // Trigger animation when lives are reduced

  if (jugadoresColocados.value.every((slot) => slot !== null) && correctos === 10) {
    resultado.value = `✅ ¡Perfecto! Ordenaste correctamente los 10 jugadores.`;
    resultadoClase.value = 'text-success bg-light';
    juegoTerminado.value = true;
    localStorage.setItem('topVentasJugado', new Date().toISOString().split('T')[0]);
    localStorage.setItem('plantillaEntregada', JSON.stringify(jugadoresColocados.value));
    plantillaEntregada.value = [...jugadoresColocados.value];
    calcularTiempoRestante();
    juegoJugado.value = true;
  } else if (vidas.value === 0) {
    resultado.value = `❌ Perdiste. Te quedaste sin vidas.`;
    resultadoClase.value = 'text-danger bg-light';
    juegoTerminado.value = true;
    localStorage.setItem('topVentasJugado', new Date().toISOString().split('T')[0]);
    localStorage.setItem('plantillaEntregada', JSON.stringify(jugadoresColocados.value));
    plantillaEntregada.value = [...jugadoresColocados.value];
    calcularTiempoRestante();
    juegoJugado.value = true;
  } else {
    resultado.value = `Ordenaste correctamente ${correctos}/10 jugadores.`;
    resultadoClase.value = 'text-warning bg-light';
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

.jugadores-wrapper {
  background: linear-gradient(135deg, #4a0000, #e30613, #4a0000);
  background-size: 400% 400%;
  animation: fuegoFondo 10s ease infinite;
  font-family: 'Bebas Neue', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
  text-align: center;
}

@keyframes fuegoFondo {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.titulo {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 15px #ff0000, 0 0 5px #fff;
  letter-spacing: 2px;
  margin-bottom: 2rem;
}

.contenedor-principal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 2rem;
}

.piramide-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.centrar-piramide {
  margin: 0 auto;
}

.slot-jugador {
  width: 140px;
  height: 70px;
  background-color: #6c757d;
  border-radius: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}

.slot-jugador:hover {
  transform: scale(1.08);
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.8);
  cursor: grab;
}

.jugador-actual {
  max-width: 220px;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(255,255,255,0.2);
  animation: bounce 1s infinite alternate;
}

@keyframes rebote {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

.posicion-numero {
  position: absolute;
  top: -10px;
  left: -10px;
  background: #fff;
  color: #000;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 0.8rem;
  line-height: 22px;
}

.resultado {
  font-size: 1.4rem;
  padding: 1rem 2rem;
  border: 2px solid #fff;
  background-color: #ffebcd;
  color: #800000;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.vidas {
  font-size: 1.2rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 10px red;
}

.vidas-container {
  gap: 0.5rem;
}

.centrado-final {
  justify-content: center !important;
}

.btn {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: #fff;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
  text-shadow: 1px 1px 2px #000;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.4s ease;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
}

.btn:hover {
  background: linear-gradient(45deg, #ff4d4d, #cc0000);
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 50, 50, 0.9);
  cursor: pointer;
}

.plantilla-entregada {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.plantilla-entregada ul {
  list-style: none;
  padding: 0;
}

.plantilla-entregada li {
  margin-bottom: 0.5rem;
}

.escudo-vida {
  width: 20px;
  height: 20px;
  margin: 0 3px;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.escudo-perdido {
  opacity: 0.2;
}

@keyframes temblor {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.temblor {
  animation: temblor 0.5s ease-in-out;
}
</style>
