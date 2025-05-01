<template>
  <div class="adivina-jugador-wrapper d-flex flex-column align-items-center justify-content-center text-white min-vh-100" style="background-color: #e70013">
    <h2 class="mb-4">⚽ Adivina el Jugador</h2>

    <!-- Pistas en fila -->
    <div class="pista-container mb-4 d-flex flex-wrap justify-content-center">
      <div class="pista-text me-2 mb-2" v-for="(pista, index) in pistasMostradas" :key="index">
        {{ pista }}
      </div>
    </div>

    <!-- Mostrar vidas -->
    <div class="vidas mb-3 d-flex justify-content-center">
    <img
  v-for="n in 5"
  :key="n"
  :class="['escudo-vida', { 'escudo-perdido': n > vidas, 'temblor': escudosTemblando }]"
  src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg/973px-Escudo_del_Club_Atl%C3%A9tico_Independiente.svg.png"
  alt="vida"
/>

    </div>

    <!-- Acciones -->
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

    <!-- Resultado -->
    <div v-if="resultado" class="resultado-container mt-4">
      <p>{{ resultado }}</p>
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

const cargarJugadores = async () => {
  try {
    const response = await fetch('/contenido_jugador_del_dia.json');
    const data = await response.json();
    jugadores.value = data.jugadores;
    seleccionarJugadorAleatorio();
  } catch (error) {
    console.error('Error al cargar los jugadores:', error);
  }
};

const seleccionarJugadorAleatorio = () => {
  const randomIndex = Math.floor(Math.random() * jugadores.value.length);
  jugadorActual.value = jugadores.value[randomIndex];
  pistaIndex.value = 0;
  const primerClub = jugadorActual.value.clubes[0];
  pistasMostradas.value = [`Debutó en ${primerClub}`];
  resultado.value = '';
  respuesta.value = '';
  filtro.value = '';
  jugadoresFiltrados.value = [];
  vidas.value = 5;
};

const mostrarPista = () => {
  // No mostrar más pistas si no hay vidas
  if (vidas.value <= 0) {
    activarTemblor();
    return;
  }

  const clubes = jugadorActual.value.clubes;

  if (pistaIndex.value < clubes.length - 1) {
    pistaIndex.value++;
    const club = clubes[pistaIndex.value];
    if (club.toLowerCase() === 'retirado') {
      pistasMostradas.value.push('Y luego se retiró 🧓');
    } else {
      pistasMostradas.value.push(club);
    }
  } else if (!pistasMostradas.value.includes('🔚 No jugó en más clubes.')) {
    pistasMostradas.value.push('🔚 No jugó en más clubes.');
  }

  vidas.value--;
  activarTemblor();
};
const activarTemblor = () => {
  escudosTemblando.value = false;
  void document.body.offsetWidth; // Forzar reflow
  escudosTemblando.value = true;

  setTimeout(() => {
    escudosTemblando.value = false;
  }, 500);
};





const actualizarSugerencias = () => {
  if (filtro.value.length >= 3) {
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

const verificarRespuesta = () => {
  if (respuesta.value === jugadorActual.value.nombre) {
    resultado.value = `🎉 ¡Correcto! Era ${jugadorActual.value.nombre}`;
  } else {
    resultado.value = '❌ Incorrecto. Intenta nuevamente.';
    if (vidas.value > 0) vidas.value--;
  }
};

onMounted(() => {
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

/* NUEVO BLOQUE: animación de temblor */
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
