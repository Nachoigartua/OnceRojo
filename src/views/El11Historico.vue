<template>
  <div class="contenedor">
    <!-- Nombre del partido -->
    <h1 class="titulo">
      {{ equipoData.equipo || 'Nombre del partido no disponible' }}
    </h1>

    <!-- Fase: Formación -->
    <div v-if="fase === 'formacion'">
      <p class="subtitulo">Tiempo restante: {{ tiempoFormateado }}</p>
      <p class="indicacion">Ingresá los nombres del 11 titular y el DT:</p>
      <input
        v-model="inputNombre"
        @keyup.enter="verificarNombre"
        class="input-jugador"
        :disabled="tiempo.value <= 0 || juegoFinalizado"
        placeholder="Escribe un nombre de jugador o DT..."
      />
      <p v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</p>

      <!-- Pizarra de jugadores -->
      <div class="pizarra">
        <!-- Cuadro del DT -->
        <div class="dt-container">
          {{ nombresAdivinados.DT || 'DT' }}
          <button
            v-if="!nombresAdivinados.DT"
            class="pista-boton"
            @click="mostrarPista('DT')"
          >
            🔍
          </button>
        </div>

        <!-- Jugadores -->
        <div class="linea" v-for="(linea, index) in pizarra" :key="index">
          <div
            v-for="(posicion, i) in linea"
            :key="i"
            class="jugador"
            :class="{ 'adivinado': nombresAdivinados[posicion] }"
          >
            {{ nombresAdivinados[posicion] || posicion }}
            <button
              v-if="!nombresAdivinados[posicion]"
              class="pista-boton"
              @click="mostrarPista(posicion)"
            >
              🔍
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cartel de mensaje -->
    <div v-if="mostrarCartel" class="cartel-mensaje">
      <p>{{ mensaje }}</p>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { obtenerFechaArgentina, calcularTiempoHastaMedianocheArgentina } from '@/utils/horaArgentina';

const equipoData = ref({});
const nombresOriginales = ref([]);
const nombresAdivinados = ref({});
const inputNombre = ref('');
const tiempo = ref(60);
const juegoFinalizado = ref(false);
const fase = ref('formacion'); // Add this line to define the 'fase' property

const pizarra = ref([]);
const mensaje = ref('');
const mostrarCartel = ref(false);
const mensajeError = ref('');

let intervalo;

const tiempoFormateado = computed(() => {
  const minutos = Math.floor(tiempo.value / 60);
  const segundos = tiempo.value % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
});

function normalizarTexto(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function generarPizarra(formacion) {
  const posiciones = formacion.map((j) => j.posicion);
  const defensas = posiciones.filter((p) => p.startsWith('DF')).map((pos) => {
    if (pos === 'DFI') return 'DFD';
    if (pos === 'DFD') return 'DFI';
    return pos;
  });
  const mediocampistas = posiciones.filter((p) => p.startsWith('MC'));
  const delanteros = posiciones.filter((p) => ['EI', 'DC', 'ED'].includes(p));
  const arquero = posiciones.filter((p) => p === 'POR');
  return [delanteros, mediocampistas, defensas, arquero];
}

onMounted(async () => {
  try {
    const hoy = obtenerFechaArgentina();
    const ultimaPartida = localStorage.getItem('ultimaPartida');
    nombresAdivinados.value = JSON.parse(localStorage.getItem('nombresAdivinados') || '{}');
    juegoFinalizado.value = localStorage.getItem('juegoFinalizado') === 'true';

    const data = await fetch(`${import.meta.env.BASE_URL}onceHistorico.json`).then(res => res.json());
    if (!data || !data[hoy]) throw new Error('Datos no disponibles');

    equipoData.value = data[hoy];
    pizarra.value = generarPizarra(equipoData.value.formacion);

    nombresOriginales.value = [
      ...equipoData.value.formacion.map((j) => ({
        nombre: normalizarTexto(j.nombre),
        posicion: j.posicion,
      })),
      { nombre: normalizarTexto(equipoData.value.dt.nombre), posicion: 'DT' },
    ];

    if (juegoFinalizado.value) {
      mensaje.value = '🎮 Ya jugaste hoy\nVuelve a jugar en ' + calcularTiempoRestante();
      mostrarCartel.value = true;
      return;
    }

    if (ultimaPartida === hoy) {
      mensaje.value = '🎮 Ya jugaste hoy\nVuelve a jugar en ' + calcularTiempoRestante();
      mostrarCartel.value = true;
      return;
    }

    const tiempoGuardado = localStorage.getItem('tiempoRestante');
    if (tiempoGuardado !== null) {
      tiempo.value = parseInt(tiempoGuardado);
    } else {
      tiempo.value = equipoData.value.tiempo_limite || 60;
      localStorage.setItem('tiempoRestante', tiempo.value.toString());
    }

    iniciarTemporizador();
  } catch (e) {
    console.error(e);
    mostrarMensajeCartel('Error al cargar los datos.');
  }
});


function mostrarMensajeCartel(texto) {
  mensaje.value = texto;
  mostrarCartel.value = true;
  setTimeout(() => (mostrarCartel.value = false), 5000);
}

function verificarNombre() {
  if (juegoFinalizado.value) return;

  const nombreIngresado = normalizarTexto(inputNombre.value.trim());
  if (!nombreIngresado) return;

  const jugador = nombresOriginales.value.find(j => {
    const apellido = normalizarTexto(j.nombre.split(' ').pop());
    return j.nombre === nombreIngresado || apellido === nombreIngresado;
  });

  if (jugador && !nombresAdivinados.value[jugador.posicion]) {
    nombresAdivinados.value[jugador.posicion] = jugador.nombre;
    inputNombre.value = '';
    mensajeError.value = '';
    localStorage.setItem('nombresAdivinados', JSON.stringify(nombresAdivinados.value));

    if (Object.keys(nombresAdivinados.value).length === nombresOriginales.value.length) {
      juegoFinalizado.value = true;
      localStorage.setItem('juegoFinalizado', 'true');
      clearInterval(intervalo);
      mostrarMensajeCartel('¡Felicidades! Has completado el 11 inicial.');
    }
  } else {
    mensajeError.value = 'Nombre incorrecto o ya ingresado.';
    setTimeout(() => (mensajeError.value = ''), 3000);
  }
}

function iniciarTemporizador() {
  if (intervalo) clearInterval(intervalo);
  intervalo = setInterval(() => {
    if (tiempo.value > 0) {
      tiempo.value--;
      localStorage.setItem('tiempoRestante', tiempo.value.toString());
    } else {
      clearInterval(intervalo);
      juegoFinalizado.value = true;
      const hoy = new Date().toISOString().split('T')[0];
      localStorage.setItem('nombresAdivinados', JSON.stringify(nombresAdivinados.value));
      localStorage.setItem('ultimaPartida', hoy);
      localStorage.setItem('juegoFinalizado', 'true');
      mostrarMensajeCartel('⏰ Se acabó el tiempo. Intenta mañana.');
    }
  }, 1000);
}




onUnmounted(() => {
  if (intervalo) clearInterval(intervalo);
});

function calcularTiempoRestante() {
  return calcularTiempoHastaMedianocheArgentina();
}

function mostrarPista(posicion) {
  let pista = '';
  if (posicion === 'DT') {
    pista = equipoData.value.dt.pista;
  } else {
    const jugador = equipoData.value.formacion.find(j => j.posicion === posicion);
    pista = jugador?.pista || 'Sin pista disponible.';
  }
  mostrarMensajeCartel(pista);
}

function generarPiramide() {
  return pizarra.value
    .map(linea => linea.map(posicion => nombresAdivinados.value[posicion] || posicion).join(' - '))
    .join('\n');
}
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700&display=swap');

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #8b0000 0%, #1a0000 100%);
  overflow-x: hidden;
  overflow-y: auto;
}

.contenedor {
  padding: 2rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
  background: transparent;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  text-align: center;
}

.titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8rem;
  color: #ff5c5c;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 64, 64, 0.7);
}

.subtitulo {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #ffdede;
}

.indicacion {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.input-jugador {
  font-size: 1rem;
  padding: 0.7rem;
  width: 100%;
  max-width: 400px;
  border: none;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 1.5rem;
  transition: 0.3s;
}

.input-jugador:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transform: scale(1.03);
}

.pizarra {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
  align-items: center;
  justify-content: center;
}

.linea {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.jugador {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #2c2c2c;
  color: rgb(255, 0, 0);
  font-weight: bold;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
}

.jugador.adivinado {
  background-color: #00b894;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 184, 148, 0.6);
}

.pista-boton {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #ffffff;
  text-shadow: 0 0 4px #000;
}

.dt-container {
  position: absolute;
  bottom: 25%;
  right: 5%;
  background-color: #f1f1f1;
  color: #333;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-shadow: none;
}

.mensaje-error {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: -1rem;
  margin-bottom: 1rem;
}
.cancha {
  position: relative;
  width: 100%;
  max-width: 700px;
  height: auto;
  aspect-ratio: 2 / 3;
  background-image: url("@/assets/cancha-verde2.png");
  background-size: cover;
  margin: 0 auto;
}
.cartel-mensaje {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1.5rem;
  border-radius: 20px;
  font-size: 1.2rem;
  margin-top: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  animation: aparecer 0.5s ease-in-out;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>
``` 