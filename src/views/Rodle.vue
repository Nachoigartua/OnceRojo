<template>
  <div class="rodle-container text-white text-center px-3">
    <h2 class="titulo-juego mb-4 animate-slide-in">🟥 Rodle 🟥</h2>

    <!-- Mensaje de "Ya jugaste hoy" -->
  <!-- Mensaje de "Ya jugaste hoy" -->
<div v-if="yaJugado && palabraDelDia">
  <p class="fs-5">Ya jugaste hoy. Volvé en:</p>
  <h3 class="reloj">{{ tiempoRestante }}</h3>

  <!-- Mostrar la grilla con intentos anteriores -->
  <div class="grilla mt-4">
    <div v-for="fila in 5" :key="fila" class="fila">
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

  <div class="mt-4">
    <p class="fs-5" :class="esCorrecto ? 'text-success' : 'text-danger'">
      {{ esCorrecto ? '✅ ¡Correcto!' : `❌ Era: ${palabraDelDia}` }}
    </p>
  </div>
</div>


    <!-- Juego principal -->
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

    <!-- Mensaje de "No hay Rodle cargado" -->
    <div v-else>
      <p class="text-warning">No hay Rodle cargado para hoy.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { obtenerFechaArgentina, calcularTiempoHastaMedianocheArgentina } from '@/utils/horaArgentina';

const intentos = ref([]); // Cada intento validado (con color)
const palabraDelDia = ref(''); // Palabra del día
const juegoTerminado = ref(false); // Si el juego terminó
const esCorrecto = ref(false); // Si la respuesta es correcta
const yaJugado = ref(false); // Si ya jugó hoy
const tiempoRestante = ref(''); // Tiempo restante para el próximo desafío
const intentoActual = ref([]); // Letras del intento en curso

// Función para calcular el tiempo restante hasta las 00:00 (hora de Argentina)
const calcularTiempoRestante = () => {
  tiempoRestante.value = calcularTiempoHastaMedianocheArgentina();
};

// Función para colorear un intento
const colorearIntento = (intento, palabra) => {
  const resultado = [];
  const usado = Array(palabra.length).fill(false);

  for (let i = 0; i < palabra.length; i++) {
    if (intento[i] === palabra[i]) {
      resultado.push({ char: intento[i], color: 'verde' });
      usado[i] = true;
    } else {
      resultado.push(null);
    }
  }

  for (let i = 0; i < palabra.length; i++) {
    if (resultado[i]) continue;
    const index = palabra.split('').findIndex((c, j) => c === intento[i] && !usado[j]);
    if (index !== -1) {
      resultado[i] = { char: intento[i], color: 'naranja' };
      usado[index] = true;
    } else {
      resultado[i] = { char: intento[i], color: 'gris' };
    }
  }

  return resultado;
};

// Función para intentar adivinar
const intentarAdivinar = () => {
  const intentoStr = intentoActual.value.join('').toLowerCase();
  if (intentoStr.length !== palabraDelDia.value.length) return;

  const resultado = colorearIntento(intentoStr, palabraDelDia.value);
  intentos.value.push(resultado);

  if (intentoStr === palabraDelDia.value) {
    esCorrecto.value = true;
    juegoTerminado.value = true;
  } else if (intentos.value.length >= 5) {
    juegoTerminado.value = true;
  }

  // Marcar como jugado y guardar progreso
  localStorage.setItem('rodle-jugado-' + obtenerFechaArgentina(), 'true');
  localStorage.setItem('rodle-intentos-' + obtenerFechaArgentina(), JSON.stringify(intentos.value));
  localStorage.setItem('rodle-correcto-' + obtenerFechaArgentina(), esCorrecto.value.toString());

  intentoActual.value = [];
};

// Función para manejar las teclas
const handleKey = (e) => {
  if (juegoTerminado.value) return;

  const letra = e.key.toLowerCase();
  if (/^[a-zñáéíóúü]$/.test(letra) && intentoActual.value.length < palabraDelDia.value.length) {
    intentoActual.value.push(letra.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  } else if (e.key === 'Backspace') {
    intentoActual.value.pop();
  } else if (e.key === 'Enter') {
    if (intentoActual.value.length === palabraDelDia.value.length) {
      intentarAdivinar();
    }
  }
};

// Función para obtener el color de una letra
const getColor = (fila, col) => {
  if (intentos.value[fila] && intentos.value[fila][col]) {
    return intentos.value[fila][col].color;
  }
  return '';
};

// Función para obtener el carácter de una letra
const getChar = (fila, col) => {
  if (intentos.value[fila]) {
    return intentos.value[fila][col]?.char?.toUpperCase() || '';
  } else if (fila === intentos.value.length) {
    return intentoActual.value[col]?.toUpperCase() || '';
  }
  return '';
};

// Cargar datos al montar el componente
onMounted(async () => {
  const clave = obtenerFechaArgentina();
  yaJugado.value = localStorage.getItem('rodle-jugado-' + clave) === 'true';

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}Rodle.json`);
    const data = await res.json();
    if (data[clave]) {
      palabraDelDia.value = data[clave].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
  } catch (error) {
    console.error('Error cargando Rodle.json:', error);
  }

  if (yaJugado.value) {
    calcularTiempoRestante();
    setInterval(calcularTiempoRestante, 1000);

    // Recuperar intentos previos (opcional, si los guardás)
    const intentosPrevios = localStorage.getItem('rodle-intentos-' + clave);
    const correctoPrevio = localStorage.getItem('rodle-correcto-' + clave);
    if (intentosPrevios) {
      intentos.value = JSON.parse(intentosPrevios);
      juegoTerminado.value = true;
      esCorrecto.value = correctoPrevio === 'true';
    }
  }

  window.addEventListener('keydown', handleKey);
});


// Limpiar eventos al desmontar el componente
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>

<style scoped>
.rodle-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #670000, #0a0000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  padding: 2rem;
  text-align: center;
}

.titulo-juego {
  font-size: 3rem;
  color: #fff;
  text-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
  margin-bottom: 2rem;
}

.reloj {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffaaaa;
  text-shadow: 0 0 6px red;
  margin-top: 0.5rem;
}

.grilla {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  margin-top: 2rem;
}

.fila {
  display: flex;
  gap: 0.5rem;
}

.letra {
  width: 4.2rem;
  height: 4.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 8px;
  background-color: #222;
  color: white;
  border: 2px solid #555;
  text-transform: uppercase;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
}

.verde {
  background-color: #4caf50;
  color: white;
}

.naranja {
  background-color: #ff9800;
  color: white;
}

.gris {
  background-color: #777;
  color: white;
}

.fs-5 {
  font-size: 1.3rem;
}
</style>

