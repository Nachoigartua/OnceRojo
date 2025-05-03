<template>
  <div class="juegos-container text-white text-center px-3">
    <!-- Título principal -->
    <h2 class="mb-5 titulo-juegos animate-slide-in">🔴Elegí tu minijuego🔴</h2>

    <!-- Tarjetas de minijuegos -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 justify-content-center animate-fade-in">
      <div class="col" v-for="(juego, index) in juegos" :key="index">
        <div class="tarjeta-juego-glow p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <h5 class="fw-bold text-white mb-3 fs-4">{{ juego.titulo }}</h5>
            <p class="text-light opacity-75">{{ juego.descripcion }}</p>
            <p class="text-light opacity-50">Dificultad: {{ juego.dificultad }}</p>
          </div>
          <button
            class="btn btn-light text-danger fw-bold mt-4 boton-jugar"
            @click="mostrarModal(juego)"
          >
            Jugar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="juegoSeleccionado" class="modal-overlay">
      <div class="modal-content animate-modal">
        <h3 class="modal-title">{{ juegoSeleccionado.titulo }}</h3>
        <p class="modal-tutorial">{{ juegoSeleccionado.tutorial }}</p>
        <div class="modal-buttons">
          <button class="btn-primary" @click="confirmarJuego">¡Jugar!</button>
          <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const juegos = [
  { 
    titulo: 'Adiviná el Gol', 
    descripcion: '¿Cómo terminó esta jugada?', 
    tutorial: 'Mira el video y selecciona cómo crees que terminó la jugada. ¡Buena suerte!',
    dificultad: '4/10' 
  },
  { 
    titulo: 'Adiviná el Jugador por trayectoria', 
    descripcion: 'Te diran clubes por los que paso el jugador, Debes adivinar!.', 
    tutorial: 'Tienes cinco vidas, cada vez que pidas una pista perderás una vida. Se te mostraran los clubes por los que pasó el jugador, debes adivinar quién es.',
    dificultad: '4/10' 
  },
  { 
    titulo: 'Adiviná el Intruso', 
    descripcion: 'Descubrí quién nunca jugó en el Rojo.', 
    tutorial: 'Entre las opciones, selecciona al jugador que nunca formó parte del rojo.',
    dificultad: '3/10' 
  },
  { 
    titulo: 'Rodle', 
    descripcion: 'Un puzle rojo por día.', 
    tutorial: 'Debes adivinar el apellido de un jugador. Cada intento te muestra pistas: verde si la letra está en la posición correcta, amarilla si está en otra posición, y gris si no forma parte del nombre.',
    dificultad: '6/10' 
  },
  { 
    titulo: 'Camisetas Legendarias', 
    descripcion: '¿Cuál es cuál? Adivina la camiseta', 
    tutorial: 'Observa las camisetas y selecciona la que corresponde al año indicado.',
    dificultad: '8/10' 
  },
  { 
    titulo: 'Trivia Roja', 
    descripcion: '⚡ Respondé en solo 10 segundos\n⚽ 3 Preguntas de la historia del Rojo por dia', 
    tutorial: 'Responde las preguntas de la historia del Rojo lo más rápido posible. ¡Tienes 10 segundos por pregunta!',
    dificultad: '5/10' 
  },
  { 
    titulo: 'Top 10 Ventas', 
    descripcion: '💸 Ordena la piramide de mayor venta a menor venta.', 
    tutorial: 'Arrastra y suelta los jugadores en la piramide, ordenándolos de mayor a menor venta, tienes 5 vidas, al darle enviar se te resta una vida y te dara una pista.',
    dificultad: '10/10🔥' 
  },
  { 
    titulo: 'El 11 Histórico', 
    descripcion: '🧠 Completá las formaciones más recordadas del Rey de Copas.', 
    tutorial: 'Tenes un tiempo limite para completar las formaciones más recordadas del Rey de Copas con su dt, cada posicion tiene una lupa que te dira una pista al tocarla',
    dificultad: '8/10' 
  }
];

const juegoSeleccionado = ref(null);

const mostrarModal = (juego) => {
  console.log('Mostrando modal para:', juego.titulo); // Debugging
  juegoSeleccionado.value = juego; // Asignar el juego seleccionado para mostrar el modal
};

const cerrarModal = () => {
  console.log('Cerrando modal'); // Debugging
  juegoSeleccionado.value = null; // Cerrar el modal
};

const confirmarJuego = () => {
  if (juegoSeleccionado.value) {
    const titulo = juegoSeleccionado.value.titulo;
    console.log('Confirmando juego:', titulo); // Debugging
    if (titulo === 'Adiviná el Gol') {
      router.push('/adivina-el-gol');
    } else if (titulo === 'Adiviná el Jugador por trayectoria') {
      router.push('/adivina-jugador-trayectoria');
    } else if (titulo === 'Camisetas Legendarias') {
      router.push('/adivina-camiseta');
    } else if (titulo === 'Adiviná el Intruso') {
      router.push('/adivina-el-intruso');
    } else if (titulo === 'Rodle') {
      router.push('/rodle');
    } else if (titulo === 'Trivia Roja') {
      router.push('/preguntas-respuestas');
    } else if (titulo === 'Top 10 Ventas') {
      router.push('/venta-jugadores');
    } else if (titulo === 'El 11 Histórico') {
      router.push('/el-11-historico');
    } else {
      alert(`El juego "${titulo}" aún no está disponible.`);
    }
    cerrarModal(); // Cerrar el modal después de redirigir
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&display=swap');

.juegos-container {
  min-height: 100vh;
  background: radial-gradient(circle, #e70013 10%, #420000 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  padding: 4rem 1rem;
  overflow-x: hidden;
}

.titulo-juegos {
  font-size: 2.8rem;
  color: white;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  animation: pulse-glow 2s infinite ease-in-out;
}

.tarjeta-juego-glow {
  background: rgba(255, 0, 0, 0.2);
  border-radius: 1.5rem;
  box-shadow: 0 0 15px rgba(255, 50, 50, 0.4);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.tarjeta-juego-glow:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 0 25px rgba(255, 100, 100, 0.6);
}

.boton-jugar {
  border-radius: 0.75rem;
  transition: all 0.25s ease;
  font-size: 1.05rem;
}
.boton-jugar:hover {
  background-color: white;
  color: #a00000;
  transform: scale(1.05);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, #670000, #e70013);
  color: white;
  padding: 2rem;
  border-radius: 1.5rem;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), 0 0 60px rgba(255, 50, 50, 0.4);
  max-width: 500px;
  width: 90%;
  animation: modalFadeIn 0.5s ease-out forwards;
}

.modal-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.modal-description {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #ffdddd;
}

.modal-tutorial {
  font-size: 1rem;
  color: #ffcccc;
  margin-top: 1rem;
  text-align: left;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(145deg, #ff4d4d, #e70013);
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
}
.btn-primary:hover {
  background: linear-gradient(145deg, #e70013, #ff4d4d);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 50, 50, 0.8);
}

.btn-secondary {
  background: #420000;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
}
.btn-secondary:hover {
  background: #670000;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

/* Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-modal {
  animation: modalFadeIn 0.5s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulse-glow {
  0% { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
  50% { text-shadow: 0 0 20px rgba(255,255,255,0.8); }
  100% { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
}

.animate-slide-in {
  animation: slideIn 1s ease-out forwards;
}
.animate-fade-in {
  animation: fadeIn 1.5s ease-out forwards;
}
</style>
