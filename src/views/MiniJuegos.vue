<template>
  <div class="juegos-container text-white text-center px-3">
    <!-- Título principal -->
    <h2 class="mb-5 titulo-juegos animate-slide-in">🔴🔴 Elegí tu Minijuego 🔴🔴 </h2>

    <!-- Tarjetas de minijuegos -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 justify-content-center animate-fade-in">
      <div class="col" v-for="(juego, index) in juegos" :key="index">
        <div class="tarjeta-juego-glow p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <h5 class="fw-bold text-white mb-3 fs-4">{{ juego.titulo }}</h5>
            <p class="text-light opacity-75">{{ juego.descripcion }}</p>
          </div>
          <button
            class="btn btn-light text-danger fw-bold mt-4 boton-jugar"
            @click="jugar(juego.titulo)"
          >
            Jugar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const juegos = [
  { titulo: 'Adiviná el Gol', descripcion: '¿Cómo terminó esta jugada?' },
  { titulo: 'Adiviná el Jugador por trayectoria', descripcion: 'Conocé ídolos y leyendas.' },
  { titulo: 'Adiviná el Intruso', descripcion: 'Descubrí quién nunca jugó en el Rojo.' },
  { titulo: 'Rodle', descripcion: 'Un Wordle rojo por día.' },
  { titulo: 'Camisetas Legendarias', descripcion: '¿Cuál es cuál?' }
]

const jugar = (titulo) => {
  if (titulo === 'Adiviná el Gol') {
    router.push('/adivina-el-gol')
  } else if (titulo === 'Adiviná el Jugador por trayectoria') {
    router.push('/adivina-jugador-trayectoria')
  } else if (titulo === 'Camisetas Legendarias') {
    router.push('/adivina-camiseta')
  } else if (titulo === 'Adiviná el Intruso') {
    router.push('/adivina-el-intruso')
  } else if (titulo === 'Rodle') {
    router.push('/rodle')
  } else {
    alert(`El juego "${titulo}" aún no está disponible.`)
  }
}
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

/* Tarjetas efecto cristal rojo */
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

/* Botón */
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

/* Animaciones */
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
