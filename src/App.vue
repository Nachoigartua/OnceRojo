<template>
  <div>
    <!-- Texto fijo arriba a la izquierda -->
    <router-link to="/minijuegos" class="marca-arriba">
      RojoOnce
    </router-link>

    <!-- Vista actual -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.marca-arriba {
  position: fixed;
  top: 15px;
  left: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #ffffff;
  background: linear-gradient(135deg, #b30016, #e70013);
  padding: 8px 16px;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 999;
  transition: all 0.3s ease;
}

.marca-arriba:hover {
  transform: scale(1.08);
  background: linear-gradient(135deg, #e70013, #b30016);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}
</style>
