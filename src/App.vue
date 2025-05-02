<template>
  <div>
    <!-- Logo arriba a la izquierda -->
    <router-link to="/minijuegos" class="marca-arriba d-flex align-items-center gap-2">
      <span class="emoji-logo"></span>
      <span class="texto-logo">🏆RojoFut11🏆</span>
    </router-link>

    <!-- Contenido dinámico -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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

.emoji-logo {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
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

/* Animación pulsante suave */
@keyframes glowLogo {
  from {
    box-shadow: 0 0 10px rgba(255, 50, 50, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 100, 100, 0.7);
  }
}
html, body, #app {
  transform: scale(0.4); /* Cambiá el valor a gusto */
  transform-origin: top left;
}

body {
  overflow-x: hidden;
}

</style>
