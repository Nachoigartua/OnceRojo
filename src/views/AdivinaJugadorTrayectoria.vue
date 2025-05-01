<template>
  <div
    class="adivina-jugador-wrapper d-flex flex-column align-items-center justify-content-center text-white min-vh-100"
    style="background: linear-gradient(to bottom, #800000, #e70013)"
  >
    <!-- Mensaje de "Ya respondiste hoy" -->
    <div v-if="yaJugado" class="text-center mt-3 mb-4">
      <p class="fs-5">
        Tu respuesta fue 
        <span :class="{'text-success': esCorrecta, 'text-danger': !esCorrecta}">
          {{ esCorrecta ? 'CORRECTA' : 'INCORRECTA' }}: {{ jugadorActual.value.nombre }}
        </span>
      </p>
      <p class="fs-5">Ya respondiste hoy. Vuelve en:</p>
      <h3 class="reloj">{{ tiempoRestante }}</h3>
    </div>

    <!-- Juego principal -->
    <div v-else>
      <h2 class="mb-4">⚽ Adivina el Jugador</h2>

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
        <button class="btn btn-light mb-3" @click="mostrarPista">Siguiente Pista</button>
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
        <button class="btn btn-success" @click="verificarRespuesta" :disabled="!respuesta">Adivinar</button>
      </div>

      <div v-if="resultado" class="resultado-container mt-4">
        <p>{{ resultado }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const jugadores = ref([]); // Lista completa de jugadores
const jugadorActual = ref(null); // Jugador del día
const pistaIndex = ref(0); // Índice de la pista actual
const pistasMostradas = ref([]); // Pistas mostradas
const filtro = ref(''); // Texto ingresado por el usuario
const jugadoresFiltrados = ref([]); // Lista de jugadores filtrados
const respuesta = ref(''); // Respuesta seleccionada
const resultado = ref(''); // Resultado del intento
const vidas = ref(5); // Vidas restantes
const escudosTemblando = ref(false); // Animación de temblor
const yaJugado = ref(false); // Si ya jugó hoy
const tiempoRestante = ref(''); // Tiempo restante para el próximo intento
const esCorrecta = ref(false); // Indica si la respuesta fue correcta

// Función para calcular el tiempo restante hasta las 00:00 (hora de Argentina)
const calcularTiempoRestante = () => {
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setHours(24, 0, 0, 0);
  const diferencia = proximaMedianoche - ahora;

  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  tiempoRestante.value = `${horas}h ${minutos}m`;
};

// Función para verificar si el usuario ya respondió
const verificarRespuestaGuardada = () => {
  const hoy = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
  const respuestaGuardada = localStorage.getItem(`jugador-jugado-${hoy}`);
  const seleccionadaGuardada = localStorage.getItem(`respuesta-jugador`);
  if (respuestaGuardada) {
    yaJugado.value = true;
    respuesta.value = seleccionadaGuardada;
    esCorrecta.value = localStorage.getItem('respuesta-correcta') === 'true';
    calcularTiempoRestante();
  }
};

// Función para guardar la respuesta en localStorage
const guardarRespuesta = () => {
  const hoy = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
  localStorage.setItem(`jugador-jugado-${hoy}`, 'respondido');
  localStorage.setItem('respuesta-correcta', esCorrecta.value);
  localStorage.setItem('respuesta-jugador', jugadorActual.value.nombre);
  yaJugado.value = true;
  calcularTiempoRestante();
};

// Cargar datos del JSON al montar el componente
const cargarJugadorDelDia = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}contenido_jugador_del_dia.json`);
    const data = await response.json();

    const hoy = new Date().toISOString().slice(0, 10);
    const jugadorDelDia = data.jugadoresPorDia.find((jugador) => jugador.fecha === hoy);

    if (jugadorDelDia) {
      jugadorActual.value = jugadorDelDia;
      pistaIndex.value = 0;
      pistasMostradas.value = [`Debutó en ${jugadorDelDia.clubes[0]}`];
    } else {
      resultado.value = '📅 No hay jugador asignado para hoy.';
    }
  } catch (error) {
    console.error('Error al cargar el jugador del día:', error);
    resultado.value = '❌ No se pudo cargar el jugador del día.';
  }
};

// Mostrar pistas adicionales
const mostrarPista = () => {
  if (vidas.value <= 0) {
    activarTemblor();
    return;
  }

  const clubes = jugadorActual.value.clubes;

  if (pistaIndex.value < clubes.length - 1) {
    pistaIndex.value++;
    const club = clubes[pistaIndex.value];
    pistasMostradas.value.push(club.toLowerCase() === 'retirado' ? 'Y luego se retiró 🧓' : club);
  } else if (!pistasMostradas.value.includes('🔚 No jugó en más clubes.')) {
    pistasMostradas.value.push('🔚 No jugó en más clubes.');
  }

  vidas.value--;
  activarTemblor();
};

// Verificar la respuesta seleccionada
const verificarRespuesta = () => {
  if (yaJugado.value) return;

  if (respuesta.value === jugadorActual.value.nombre) {
    resultado.value = `🎉 ¡CORRECTO! Era ${jugadorActual.value.nombre}`;
    esCorrecta.value = true;
  } else {
    resultado.value = '❌ INCORRECTO. Intenta nuevamente.';
    esCorrecta.value = false;
    if (vidas.value > 0) vidas.value--;
  }

  guardarRespuesta();
};

// Cargar todos los jugadores
const cargarJugadores = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}contenido_jugador_del_dia.json`);
    const data = await response.json();
    jugadores.value = data.jugadoresPorDia;
  } catch (error) {
    console.error('Error al cargar los jugadores:', error);
  }
};

// Actualizar sugerencias de autocompletado
const actualizarSugerencias = () => {
  if (filtro.value.trim().length >= 3) {
    jugadoresFiltrados.value = jugadores.value.filter((jugador) =>
      jugador.nombre.toLowerCase().includes(filtro.value.toLowerCase())
    );
  } else {
    jugadoresFiltrados.value = [];
  }
};

// Seleccionar un jugador de las sugerencias
const seleccionarJugador = (nombre) => {
  respuesta.value = nombre;
  filtro.value = nombre;
  jugadoresFiltrados.value = [];
};

// Activar animación de temblor
const activarTemblor = () => {
  escudosTemblando.value = false;
  void document.body.offsetWidth;
  escudosTemblando.value = true;

  setTimeout(() => {
    escudosTemblando.value = false;
  }, 500);
};

// Montar el componente
onMounted(() => {
  verificarRespuestaGuardada();
  cargarJugadorDelDia();
  cargarJugadores();
});
</script>


<style scoped>
.adivina-jugador-wrapper {
  text-align: center;
}

.pista-container {
  font-size: 1rem;
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
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px red;
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
</style>