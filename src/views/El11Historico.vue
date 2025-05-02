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

const equipoData = ref({}); // Datos del equipo
const nombresOriginales = ref([]); // Nombres originales del equipo
const nombresAdivinados = ref({}); // Nombres adivinados por posición
const inputNombre = ref('');
const tiempo = ref(60); // Tiempo en segundos
const fase = ref('formacion'); // Solo queda la fase "formacion"
const juegoFinalizado = ref(false); // Indica si el juego ha finalizado

const pizarra = ref([]); // Pizarra de jugadores según el esquema

const mensaje = ref(''); // Mensaje del cartel
const mostrarCartel = ref(false); // Controla la visibilidad del cartel
const mensajeError = ref(''); // Mensaje de error para nombres incorrectos

let intervalo; // Mover el intervalo a un ámbito superior para accederlo en onUnmounted

// Formatear el tiempo restante en formato mm:ss
const tiempoFormateado = computed(() => {
  const minutos = Math.floor(tiempo.value / 60);
  const segundos = tiempo.value % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
});

// Normalizar texto (elimina acentos y convierte a minúsculas)
function normalizarTexto(texto) {
  if (typeof texto !== 'string') return ''; // Validar que el texto sea una cadena
  return texto
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .toLowerCase(); // Convierte a minúsculas
}

// Generar la pizarra según el esquema
function generarPizarra(formacion) {
  const posiciones = formacion.map((jugador) => jugador.posicion);
  const arquero = posiciones.filter((pos) => pos === 'POR');
  const defensas = posiciones.filter((pos) => pos.startsWith('DF'));

  // Invertir DFI y DFD
  const defensasInvertidas = defensas.map((pos) => {
    if (pos === 'DFI') return 'DFD';
    if (pos === 'DFD') return 'DFI';
    return pos;
  });

  const mediocampistas = posiciones.filter((pos) => pos.startsWith('MC'));
  const delanteros = posiciones.filter((pos) => ['EI', 'DC', 'ED'].includes(pos));

  return [
    delanteros,
    mediocampistas,
    defensasInvertidas,
    arquero, // El arquero siempre al final
  ];
}

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const ultimaPartida = localStorage.getItem('ultimaPartida');
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];

    // Cargar nombres adivinados y estado del juego desde localStorage
    const nombresGuardados = JSON.parse(localStorage.getItem('nombresAdivinados') || '{}');
    nombresAdivinados.value = nombresGuardados;

    // Verificar si el juego ya está finalizado
    const juegoFinalizadoGuardado = localStorage.getItem('juegoFinalizado') === 'true';
    const data = await fetch(`${import.meta.env.BASE_URL}onceHistorico.json`).then((res) =>
      res.json()
    );

    if (!data || !data[hoy]) {
      throw new Error('Datos del equipo no disponibles para hoy.');
    }

    equipoData.value = data[hoy] || { equipo: '', dt: '', formacion: [], esquema: '4-3-3', tiempo_limite: 60 };

    // Generar la pizarra según la formación
    pizarra.value = generarPizarra(equipoData.value.formacion);

    if (juegoFinalizadoGuardado) {
      juegoFinalizado.value = true; // Marcar el juego como finalizado
      mensaje.value = 'El juego ya ha finalizado.';
      mostrarCartel.value = true;
      return; // No continuar con la inicialización del temporizador
    }

    if (ultimaPartida === hoy) {
      const tiempoRestante = calcularTiempoRestante();
      mensaje.value = `Vuelve a jugar en ${tiempoRestante}`;
      mostrarCartel.value = true;
      return;
    }

    // Establecer el tiempo límite desde el JSON
    tiempo.value = equipoData.value.tiempo_limite || 60;

    // Normalizar nombres originales para comparación
    nombresOriginales.value = [
      ...equipoData.value.formacion.map((jugador) => ({
        nombre: normalizarTexto(jugador.nombre),
        posicion: jugador.posicion,
      })),
      { nombre: normalizarTexto(equipoData.value.dt), posicion: 'DT' },
    ];

    iniciarTemporizador();
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    mostrarMensajeCartel('Error al cargar los datos. Intenta nuevamente más tarde.');
  }
});

// Mostrar un cartel con mensaje y avanzar a la siguiente fase
function mostrarMensajeCartel(texto) {
  mensaje.value = texto;
  mostrarCartel.value = true;

  setTimeout(() => {
    mostrarCartel.value = false;
  }, 5000); // Mostrar el cartel por 5 segundos
}

// Verificar si el nombre ingresado es correcto
function verificarNombre() {
  if (juegoFinalizado.value) return; // Evitar que se pueda jugar si el juego terminó

  const nombreIngresado = normalizarTexto(inputNombre.value.trim());
  if (!nombreIngresado) return;

  // Verificar si coincide con algún nombre completo o apellido
  const jugadorEncontrado = nombresOriginales.value.find((jugador) => {
    const nombreNormalizado = jugador.nombre;
    const apellido = normalizarTexto(jugador.nombre.split(' ').pop()); // Obtener solo el apellido
    return nombreNormalizado === nombreIngresado || apellido === nombreIngresado;
  });

  if (jugadorEncontrado && !nombresAdivinados.value[jugadorEncontrado.posicion]) {
    nombresAdivinados.value[jugadorEncontrado.posicion] = jugadorEncontrado.nombre;
    inputNombre.value = '';
    mensajeError.value = ''; // Limpiar mensaje de error

    // Guardar progreso en localStorage
    localStorage.setItem('nombresAdivinados', JSON.stringify(nombresAdivinados.value));

    if (Object.keys(nombresAdivinados.value).length === nombresOriginales.value.length) {
      mostrarMensajeCartel('¡Felicidades! Has completado el 11 inicial.');
      juegoFinalizado.value = true; // Marcar el juego como finalizado
      localStorage.setItem('juegoFinalizado', 'true'); // Guardar estado finalizado
      clearInterval(intervalo); // Detener el temporizador
    }
  } else {
    mensajeError.value = 'Nombre incorrecto o ya ingresado.';
    setTimeout(() => (mensajeError.value = ''), 3000); // Ocultar mensaje después de 3 segundos
  }
}

// Iniciar el temporizador
function iniciarTemporizador() {
  if (intervalo) clearInterval(intervalo); // Asegurarse de limpiar cualquier temporizador previo
  intervalo = setInterval(() => {
    tiempo.value--;
    if (tiempo.value <= 0) {
      clearInterval(intervalo);
      juegoFinalizado.value = true; // Marcar el juego como finalizado

      // Guardar nombres adivinados y registrar que el usuario ya jugó
      localStorage.setItem('nombresAdivinados', JSON.stringify(nombresAdivinados.value));
      const hoy = new Date().toISOString().split('T')[0];
      localStorage.setItem('ultimaPartida', hoy);

      if (Object.keys(nombresAdivinados.value).length === nombresOriginales.value.length) {
        mostrarMensajeCartel('¡Felicidades! Has completado el 11 inicial.');
      } else {
        mostrarMensajeCartel('Se acabó el tiempo. Intenta nuevamente mañana.');
      }
    }
  }, 1000);
}

// Limpiar estados al desmontar el componente
onUnmounted(() => {
  if (intervalo) clearInterval(intervalo); // Detener el temporizador si está activo
  tiempo.value = 60; // Reiniciar el tiempo
  juegoFinalizado.value = false; // Reiniciar el estado del juego
  nombresAdivinados.value = {}; // Limpiar nombres adivinados
  mostrarCartel.value = false; // Ocultar cualquier cartel
  mensajeError.value = ''; // Limpiar mensajes de error
  inputNombre.value = ''; // Limpiar el input
});

// Calcular el tiempo restante para las 00:00 (hora de Argentina)
function calcularTiempoRestante() {
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setHours(24, 0, 0, 0); // Establecer a las 00:00 del día siguiente
  const diferencia = proximaMedianoche - ahora;

  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  return `${horas}h ${minutos}m`;
}

// Mostrar la pista de un jugador o DT
function mostrarPista(posicion) {
  let pista = '';
  if (posicion === 'DT') {
    pista = equipoData.value.dt.pista; // Obtener la pista del DT
  } else {
    const jugador = equipoData.value.formacion.find((j) => j.posicion === posicion);
    pista = jugador?.pista || 'No hay pista disponible para esta posición.';
  }
  mostrarMensajeCartel(pista);
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700&display=swap');

/* Fondo global para toda la pantalla */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;

  background: radial-gradient(circle, #8b0000 0%, #1a0000 100%);
  /* Cambiar overflow para permitir desplazamiento */
  overflow-x: hidden; /* Solo ocultar desplazamiento horizontal */
  overflow-y: auto; /* Permitir desplazamiento vertical */
}

.contenedor {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  background: transparent; /* Fondo transparente para que el fondo global se vea */
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
  gap: 1.2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.2rem;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
}

.linea {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
}

.jugador {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: #2c2c2c;
  color: rgb(255, 0, 0);
  font-weight: bold;
  font-size: 0.6rem; /* Reducir el tamaño del texto */
  display: flex;
  flex-direction: column; /* Alinear posición y lupa en columna */
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  position: relative; /* Asegurar que los elementos hijos estén dentro */
}

.jugador.adivinado {
  background-color: #00b894;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 184, 148, 0.6);
}

.dt-container {
  position: absolute;
  top: 19rem; /* Ajusta la posición vertical */
  right: 3rem; /* Ajusta la posición horizontal */
  background-color: #f1f1f1;
  color: #333;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-shadow: none;
}

.boton {
  background-color: #222;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 1rem;
  transition: 0.2s;
}

.boton:hover {
  background-color: #e63946;
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 64, 64, 0.5);
}

.boton.correcto {
  background-color: #00b894;
  color: white;
  box-shadow: 0 0 10px rgba(0, 184, 148, 0.6);
}

.boton.incorrecto {
  background-color: #e63946;
  color: white;
  box-shadow: 0 0 10px rgba(230, 57, 70, 0.6);
}

.grid {
  margin-top: 1rem;
  gap: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.cartel-mensaje {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  font-size: 1.2rem;
  z-index: 1000;
}

.mensaje-error {
  margin-top: 0.5rem;
  color: #ff5c5c;
  font-size: 0.9rem;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(10px);
  }
}

.pista-boton {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 0.8rem; /* Reducir el tamaño de la lupa */
  cursor: pointer;
  margin-top: 0.2rem; /* Separar ligeramente de la posición */
  transition: transform 0.2s;
}

.pista-boton:hover {
  transform: scale(1.1); /* Reducir el efecto de escala */
}
</style>