<template>
  <div class="app-container">
    <!-- Logo arriba a la izquierda (solo si NO estás en /minijuegos) -->
    <router-link
      v-if="!esMinijuegos"
      to="/minijuegos"
      class="marca-arriba d-flex align-items-center gap-2"
    >
      <span class="texto-logo">🏆RojoFut11🏆</span>
    </router-link>

    <!-- Contenido dinámico -->
    <div class="contenido">
      <router-view />
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2025 RojoFut11. Todos los derechos reservados.</p>
      <p>Creado con ❤️ por hinchas del Rojo</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    esMinijuegos() {
      return this.$route.path === '/minijuegos';
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

.marca-arriba {
  position: fixed;
  top: 16px;
  left: 20px;
  padding: 10px 18px;
  background: linear-gradient(145deg, #b30016, #e70013);
  border-radius: 1rem;
  text-decoration: none;
  z-index: 999;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease-in-out;
  animation: glowLogo 2s ease-in-out infinite alternate;
}

.texto-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 1px;
  color: white;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
}

.marca-arriba:hover {
  transform: scale(1.08) rotate(-1deg);
  box-shadow: 0 0 15px rgba(255, 80, 80, 0.7);
}

@keyframes glowLogo {
  from {
    box-shadow: 0 0 10px rgba(255, 50, 50, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 100, 100, 0.7);
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #111; /* fondo oscuro uniforme para evitar bordes blancos */
}

.contenido {
  flex: 1;
  padding-bottom: 2rem;
}

.footer {
  background-color: #333; /* gris oscuro */
  color: white;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.9rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.3);
  border-top: 1px solid #444;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #111;
}

body {
  overflow-x: hidden;
}
</style>
