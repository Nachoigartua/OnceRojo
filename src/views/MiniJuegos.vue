<template>
  <div class="text-white text-center min-vh-100 d-flex flex-column align-items-center justify-content-center px-3" style="background: radial-gradient(circle, #e70013 30%, #a0000f 100%)">
    <!-- Botón en la parte superior izquierda -->
 

    <h2 class="mb-4">🕹️ Elegí tu Minijuego</h2>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 justify-content-center">
      <div class="col" v-for="(juego, index) in juegos" :key="index">
        <div class="card h-100 text-dark shadow rounded-4">
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ juego.titulo }}</h5>
            <p class="card-text">{{ juego.descripcion }}</p>
            <button
              class="btn btn-danger w-100 mt-2"
              @click="jugar(juego.titulo)"
            >
              Jugar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const juegos = [
  { titulo: 'Adivina el gol', descripcion: '¿Como termino esta jugada?' },
  { titulo: 'Adiviná el Jugador por trayectoria', descripcion: 'Conocé ídolos y leyendas.' },
  { titulo: 'Momentos Clave', descripcion: 'Identificá hitos inolvidables.' },
  { titulo: 'Orden Cronológico', descripcion: 'Ordená partidos y logros.' },
  { titulo: 'Camisetas Legendarias', descripcion: '¿Cuál es cuál?' }
]

const jugar = (titulo) => {
  if (titulo === 'Adivina el gol') {
    router.push('/adivina-el-gol')
  } else if (titulo === 'Adiviná el Jugador por trayectoria') {
    router.push('/adivina-jugador-trayectoria') // ✅ Redirige a la ruta correcta
  } else {
    console.log(`El juego "${titulo}" aún no está disponible.`)
  }
}
</script>

<style scoped>
.boton-inicio {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.btn-inicio {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s ease;
}

.btn-inicio:hover {
  color: #ffcccc;
}
</style>
