import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '../views/Inicio.vue';

const routes = [
  { path: '/', name: 'Inicio', component: Inicio },
  { path: '/minijuegos', name: 'Minijuegos', component: () => import('../views/MiniJuegos.vue') },
  { path: '/adivina-el-gol', name: 'AdivinaElGol', component: () => import('../views/AdivinaElGol.vue') },
  { path: '/adivina-jugador-trayectoria', name: 'AdivinaJugadorTrayectoria', component: () => import('../views/AdivinaJugadorTrayectoria.vue') },
  { path: '/adivina-camiseta', name: 'AdivinaCamiseta', component: () => import('../views/AdivinaCamiseta.vue') }, // 👈 Nueva ruta agregada
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
