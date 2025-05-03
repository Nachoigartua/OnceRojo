<template>
  <div
    class="adivina-jugador-wrapper d-flex flex-column align-items-center justify-content-center text-white min-vh-100"
    style="background: linear-gradient(to bottom, #4b0000, #800000, #e70013)"
  >
    <!-- Si ya jugó, se muestra solo el estado de las pistas, vidas y el reloj -->
    <div v-if="yaJugado">
      <h2 class="mb-4 animate-title">⚽ Adivina el Jugador</h2>

      <div class="pista-container mb-4 d-flex flex-wrap justify-content-center">
        <div class="pista-text me-2 mb-2" v-for="(pista, index) in pistasMostradas" :key="index">
          {{ pista }}
        </div>
      </div>

      <div class="vidas mb-3 d-flex justify-content-center">
        <img
          v-for="n in 5"
          :key="n"
          :class="['escudo-vida', { 'escudo-perdido': n > vidas, 'temblor': escudosTemblando }]"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg/973px-Escudo_del_Club_Atl%C3%A9tico_Independiente.svg.png"
          alt="vida"
        />
      </div>

      <div class="resultado-container mt-4">
        <p v-if="esCorrecta" class="text-success">🎉 ¡CORRECTO! Era {{ jugadorActual?.nombre }}</p>
        <p v-else class="text-danger">❌ INCORRECTO. Era {{ jugadorActual?.nombre }}</p>
      </div>

      <div class="text-center mt-3">
        <p class="fs-5">Ya respondiste hoy. Vuelve en:</p>
        <h3 class="reloj">{{ tiempoRestante }}</h3>
      </div>
    </div>

    <!-- Juego principal -->
    <div v-else>
      <h2 class="mb-4 animate-title">⚽ Adivina el Jugador</h2>

      <div class="pista-container mb-4 d-flex flex-wrap justify-content-center">
        <div class="pista-text me-2 mb-2" v-for="(pista, index) in pistasMostradas" :key="index">
          {{ pista }}
        </div>
      </div>

      <div class="vidas mb-3 d-flex justify-content-center">
        <img
          v-for="n in 5"
          :key="n"
          :class="['escudo-vida', { 'escudo-perdido': n > vidas, 'temblor': escudosTemblando }]"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg/973px-Escudo_del_Club_Atl%C3%A9tico_Independiente.svg.png"
          alt="vida"
        />
      </div>

      <div class="acciones-container d-flex flex-column align-items-center">
        <button class="btn btn-light mb-3 animate-button" @click="mostrarPista">Siguiente Pista</button>
        <div class="autocomplete-container position-relative w-100">
          <input
            type="text"
            v-model="filtro"
            class="form-control mb-3"
            placeholder="Escribe el nombre del jugador"
            @input="actualizarSugerencias"
          />
          <ul
            v-if="jugadoresFiltrados.length > 0"
            class="autocomplete-list list-group position-absolute w-100"
          >
            <li
              v-for="(jugador, index) in jugadoresFiltrados"
              :key="index"
              class="list-group-item list-group-item-action"
              @click="seleccionarJugador(jugador.nombre)"
            >
              {{ jugador.nombre }}
            </li>
          </ul>
        </div>
        <button class="btn btn-success animate-button" @click="verificarRespuesta" :disabled="!respuesta">Adivinar</button>
      </div>

      <div v-if="resultado" class="resultado-container mt-4">
        <p v-if="esCorrecta" class="text-success">🎉 ¡CORRECTO! Era {{ jugadorActual?.nombre }}</p>
        <p v-else class="text-danger">❌ INCORRECTO. Intenta nuevamente.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';

const jugadores = ref([]);
const jugadorActual = ref(null);
const pistaIndex = ref(0);
const pistasMostradas = ref([]);
const filtro = ref('');
const jugadoresFiltrados = ref([]);
const respuesta = ref('');
const resultado = ref('');
const vidas = ref(5);
const escudosTemblando = ref(false);
const yaJugado = ref(false);
const tiempoRestante = ref('');
const esCorrecta = ref(false);

const hoy = new Date().toISOString().slice(0, 10);

// Calcular tiempo hasta medianoche
const calcularTiempoRestante = () => {
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setHours(24, 0, 0, 0);
  const diferencia = proximaMedianoche - ahora;

  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  tiempoRestante.value = `${horas}h ${minutos}m`;
};

// Verificar si ya jugó hoy
const verificarRespuestaGuardada = () => {
  const respuestaGuardada = localStorage.getItem(`jugador-jugado-${hoy}`);
  if (respuestaGuardada) {
    yaJugado.value = true;
    respuesta.value = localStorage.getItem('respuesta-jugador') || '';
    esCorrecta.value = localStorage.getItem('respuesta-correcta') === 'true';
    resultado.value = localStorage.getItem('resultado-jugador') || '';

    const pistasGuardadas = localStorage.getItem(`pistas-mostradas-${hoy}`);
    if (pistasGuardadas) {
      pistasMostradas.value = JSON.parse(pistasGuardadas);
      pistaIndex.value = pistasMostradas.value.length - 1;
    }

    const vidasGuardadas = localStorage.getItem(`vidas-jugador-${hoy}`);
    if (vidasGuardadas !== null) {
      vidas.value = parseInt(vidasGuardadas);
    }

    calcularTiempoRestante();
  }
};

// Guardar progreso
const guardarRespuesta = () => {
  localStorage.setItem(`jugador-jugado-${hoy}`, 'respondido');
  localStorage.setItem('respuesta-correcta', esCorrecta.value);
  localStorage.setItem('respuesta-jugador', jugadorActual.value?.nombre || '');
  localStorage.setItem('resultado-jugador', resultado.value);
  localStorage.setItem(`pistas-mostradas-${hoy}`, JSON.stringify(pistasMostradas.value));
  localStorage.setItem(`vidas-jugador-${hoy}`, vidas.value);
  yaJugado.value = true;
  calcularTiempoRestante();
};

// Cargar el jugador del día
const cargarJugadorDelDia = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}contenido_jugador_del_dia.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const jugadorDelDia = data.jugadoresPorDia.find(j => j.fecha === hoy);
    if (jugadorDelDia) {
      jugadorActual.value = jugadorDelDia;
      if (pistasMostradas.value.length === 0) {
        pistaIndex.value = 0;
        pistasMostradas.value = [`Debutó en ${jugadorDelDia.clubes[0]}`];
      }
    } else {
      resultado.value = '📅 No hay jugador asignado para hoy.';
    }
  } catch (error) {
    console.error('Error al cargar el jugador del día:', error);
    resultado.value = '❌ No se pudo cargar el jugador del día.';
  }
};

// Mostrar pista con flechitas
const mostrarPista = () => {
  if (vidas.value <= 0) {
    activarTemblor();
    return;
  }

  const clubes = jugadorActual.value?.clubes || [];

  if (pistaIndex.value < clubes.length - 1) {
    pistaIndex.value++;
    const club = clubes[pistaIndex.value];
    pistasMostradas.value.push(
      pistaIndex.value === 0
        ? club
        : `➡️ ${club.toLowerCase() === 'retirado' ? 'Y luego se retiró 🧓' : club}`
    );
  } else if (!pistasMostradas.value.includes('🔚 No jugó en más clubes.')) {
    pistasMostradas.value.push('🔚 No jugó en más clubes.');
  }

  vidas.value--;
  activarTemblor();
  localStorage.setItem(`pistas-mostradas-${hoy}`, JSON.stringify(pistasMostradas.value));
  localStorage.setItem(`vidas-jugador-${hoy}`, vidas.value);
};

// Verificar la respuesta
const verificarRespuesta = () => {
  if (yaJugado.value) return;
  if (!jugadorActual.value) {
    resultado.value = '❌ Error: No se pudo cargar el jugador del día.';
    return;
  }

  if (respuesta.value === jugadorActual.value.nombre) {
    esCorrecta.value = true;
    resultado.value = '✅ ¡Correcto!';
  } else {
    esCorrecta.value = false;
    resultado.value = '❌ Incorrecto.';
    if (vidas.value > 0) vidas.value--;
  }

  guardarRespuesta();
};

// Cargar todos los jugadores
const cargarJugadores = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}contenido_jugador_del_dia.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    jugadores.value = data.jugadoresPorDia;
  } catch (error) {
    console.error('Error al cargar los jugadores:', error);
  }
};

// Autocompletado
const actualizarSugerencias = () => {
  if (filtro.value.trim().length >= 3) {
    jugadoresFiltrados.value = jugadores.value.filter((jugador) =>
      jugador.nombre.toLowerCase().includes(filtro.value.toLowerCase())
    );
  } else {
    jugadoresFiltrados.value = [];
  }
};

const seleccionarJugador = (nombre) => {
  respuesta.value = nombre;
  filtro.value = nombre;
  jugadoresFiltrados.value = [];
};

// Temblor escudos
const activarTemblor = () => {
  escudosTemblando.value = false;
  void document.body.offsetWidth;
  escudosTemblando.value = true;

  setTimeout(() => {
    escudosTemblando.value = false;
  }, 500);
};

// Inicio
onMounted(() => {
  verificarRespuestaGuardada();
  cargarJugadorDelDia();
  cargarJugadores();
});
</script>


<style scoped>
.adivina-jugador-wrapper {
  text-align: center;
  animation: fadeIn 1s ease-in-out;
}

.pista-container {
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.pista-text {
  background-color: #a0000f;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  color: white;
  margin: 0.25rem;
  white-space: nowrap;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  animation: pulse 1.5s infinite;
}

.autocomplete-container {
  position: relative;
}

.autocomplete-list {
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.reloj {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px red, 0 0 20px #ff0000;
}

.autocomplete-list .list-group-item {
  cursor: pointer;
}

.autocomplete-list .list-group-item:hover {
  background-color: #f0f0f0;
}

.acciones-container button {
  width: 200px;
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

.resultado-container {
  font-size: 1.2rem;
  font-weight: bold;
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

.animate-title {
  animation: slideIn 1s ease-in-out;
}

.animate-button {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.animate-button:hover {
  transform: scale(1.1);
  background-color: #ff4d4d;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>