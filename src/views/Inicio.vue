<template>
  <div class="app text-white text-center d-flex flex-column justify-content-center align-items-center min-vh-100 px-3 animate-fade-in">
    <header class="mb-4">
      <h1 class="display-2 fw-bold animate-slide-in">👑RojoFut11👑</h1>
      <p class="lead animate-fade-delay">Minijuegos diarios sobre la historia del <strong>Rey de Copas</strong></p>
    </header>

    <main class="my-4 animate-fade-delay-2">
      <p>🔥 ¡Descubrí nuevos desafíos cada día a las <strong>00:00</strong>!</p>
      <p>Poné a prueba tus conocimientos sobre <em>jugadores, momentos icónicos y más</em>.</p>
      <div class="d-flex flex-wrap justify-content-center gap-4 mt-5">
        <!-- Botón Jugar Ahora -->
        <button
          class="btn-jugar"
          @click="irAMinijuegos"
        >
          Jugar Ahora
        </button>
      </div>
    </main>

    <footer class="small mt-5 opacity-75 animate-fade-delay-3">
      <p class="mb-1">&copy; 2025 <strong>Independiente 11</strong>. Todos los derechos reservados.</p>
      <p>Diseñado con pasión por y para los hinchas del <strong>Rojo</strong>.</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const irAMinijuegos = () => {
  router.push('/minijuegos')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

.app {
  background: radial-gradient(circle, #e70013 20%, #750000 100%);
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
}

/* ANIMACIONES */
@keyframes fadeIn {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes slideIn {
  0% { opacity: 0; transform: translateY(-30px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
.animate-slide-in {
  animation: slideIn 1s ease-out forwards;
}
.animate-fade-delay {
  animation: fadeIn 1.5s ease-out forwards;
}
.animate-fade-delay-2 {
  animation: fadeIn 2s ease-out forwards;
}
.animate-fade-delay-3 {
  animation: fadeIn 2.5s ease-out forwards;
}

/* BOTONES PERSONALIZADOS */
.btn-jugar {
  background-color: #ffffff;
  color: #e70013;
  border: none;
  padding: 12px 32px;
  font-weight: 700;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.3s;
}
.btn-jugar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.btn-info {
  background-color: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  padding: 12px 32px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.btn-info:hover {
  background-color: #ffffff20;
  border-color: #ffb3b3;
}
</style>
