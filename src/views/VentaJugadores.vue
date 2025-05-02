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
    </div>

    <!-- Vidas restantes -->
    <div class="vidas mt-4" v-if="!juegoJugado">
      <p class="text-center">❤️ Vidas restantes: {{ vidas }}</p>
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

const getImagenUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/,'')}`;

const shuffle = (array) => {
  let m = array.length, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    [array[m], array[i]] = [array[i], array[m]];
  }
  return array;
};

function calcularTiempoRestante() {
  const ahora = new Date();
  const ahoraUTC = new Date(ahora.getTime() + ahora.getTimezoneOffset() * 60000);
  const argentina = new Date(ahoraUTC.getTime() - 3 * 60 * 60000);
  const siguiente = new Date(argentina);
  siguiente.setHours(24, 0, 0, 0);
  const diffMs = siguiente - argentina;
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  tiempoRestante.value = `${h}h ${m}m`;
}

onMounted(async () => {
  const hoy = new Date().toISOString().split('T')[0];
  const jugado = localStorage.getItem('topVentasJugado') === hoy;

  if (jugado) {
    juegoJugado.value = true;
    calcularTiempoRestante();
    return;
  }

  try {
    const data = await fetch(`${import.meta.env.BASE_URL}jugadores_ventas.json`).then((res) =>
      res.json()
    );
    const jugadoresAleatorios = shuffle(data).slice(0, 10);
    jugadoresReferencia.value = [...jugadoresAleatorios].sort((a, b) => b.coste - a.coste);
    jugadores.value = shuffle(jugadoresAleatorios);
    jugadorActual.value = jugadores.value.shift();
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

const verificarOrden = () => {
  let correctos = 0;

  jugadoresColocados.value.forEach((jugador, index) => {
    if (jugador && jugador.coste === jugadoresReferencia.value[index]?.coste) {
      correctos++;
    }
  });

  vidas.value--;

  if (jugadoresColocados.value.every((slot) => slot !== null) && correctos === 10) {
    resultado.value = `✅ ¡Perfecto! Ordenaste correctamente los 10 jugadores.`;
    resultadoClase.value = 'text-success bg-light';
    juegoTerminado.value = true;
    localStorage.setItem('topVentasJugado', new Date().toISOString().split('T')[0]);
    calcularTiempoRestante();
    juegoJugado.value = true;
  } else if (vidas.value === 0) {
    resultado.value = `❌ Perdiste. Te quedaste sin vidas.`;
    resultadoClase.value = 'text-danger bg-light';
    juegoTerminado.value = true;
    localStorage.setItem('topVentasJugado', new Date().toISOString().split('T')[0]);
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
}
.contenedor-principal {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px; /* espacio entre la pirámide y el jugador actual */
  width: 100%;
  flex-wrap: wrap; /* por si en pantallas chicas baja uno abajo */
  transition: all 0.5s ease;
}

.piramide-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0rem;
  transition: all 0.5s ease;
  margin-top: -45px; /* sube la pirámide */

}

.centrar-piramide {
  margin: 0 auto;
}

.slot-jugador {
  border: 2px solid #ffffff;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.slot-jugador:hover {
  transform: scale(1.08);
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.8);
  cursor: grab;
}

.jugador-actual {
  background: radial-gradient(circle, #ffffff, #ff0000);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.9);
  border: 3px solid #fff;
  animation: rebote 1s infinite;
}

@keyframes rebote {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.posicion-numero {
  background-color: #ffffff;
  color: #4a0000;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
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


.btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px #ffffff;
}
</style>