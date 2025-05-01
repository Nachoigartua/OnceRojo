import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '../views/Inicio.vue';

const routes = [
  { path: '/', name: 'Inicio', component: Inicio },
  { path: '/minijuegos', name: 'Minijuegos', component: () => import('../views/MiniJuegos.vue') },
  { path: '/adivina-el-gol', name: 'AdivinaElGol', component: () => import('../views/AdivinaElGol.vue') },
  { path: '/adivina-jugador-trayectoria', name: 'AdivinaJugadorTrayectoria', component: () => import('../views/AdivinaJugadorTrayectoria.vue') },
  { path: '/adivina-camiseta', name: 'AdivinaCamiseta', component: () => import('../views/AdivinaCamiseta.vue') },
  { path: '/adivina-el-intruso', name: 'AdivinaElIntruso', component: () => import('../views/AdivinaElIntruso.vue') },
  { path: '/rodle', name: 'Rodle', component: () => import('../views/Rodle.vue') } // 👈 Nueva ruta para Rodle
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
