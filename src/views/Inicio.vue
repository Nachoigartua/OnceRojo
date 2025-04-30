<template>
  <div class="app text-white text-center d-flex flex-column justify-content-center align-items-center min-vh-100 px-3">
    <header>
      <h1 class="display-3 fw-bold">🎮 Independiente 11</h1>
      <p class="lead">Minijuegos diarios sobre la historia del Rey de Copas</p>
    </header>

    <main class="my-4">
      <p>¡Descubre nuevos desafíos cada día a las 00:00!</p>
      <p>Poné a prueba tus conocimientos sobre jugadores, momentos icónicos y más.</p>
      <div class="d-flex flex-wrap justify-content-center gap-3 mt-4">
        <!-- Botón Jugar Ahora -->
        <button
          class="btn btn-light fw-bold text-danger px-4 py-2"
          @click="irAMinijuegos"
        >
          Jugar Ahora
        </button>
        <button class="btn btn-outline-light px-4 py-2">Más Información</button>
      </div>
    </main>

    <footer class="small mt-5 opacity-75">
      <p class="mb-1">&copy; 2025 Independiente 11. Todos los derechos reservados.</p>
      <p>Diseñado para los hinchas del Rey de Copas.</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Función para redirigir a la página de minijuegos
const irAMinijuegos = () => {
  router.push('/minijuegos') // Redirige a la ruta /minijuegos
}
</script>

<style scoped>
.app {
  background: radial-gradient(circle, #e70013 30%, #a0000f 100%);
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
}
</style>