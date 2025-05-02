import { createRouter, createWebHashHistory } from 'vue-router';
import Inicio from '../views/Inicio.vue';

const routes = [
  { path: '/', name: 'Inicio', component: Inicio },
  { path: '/minijuegos', name: 'Minijuegos', component: () => import('../views/MiniJuegos.vue') },
  { path: '/adivina-el-gol', name: 'AdivinaElGol', component: () => import('../views/AdivinaElGol.vue') },
  { path: '/adivina-jugador-trayectoria', name: 'AdivinaJugadorTrayectoria', component: () => import('../views/AdivinaJugadorTrayectoria.vue') },
  { path: '/adivina-camiseta', name: 'AdivinaCamiseta', component: () => import('../views/AdivinaCamiseta.vue') },
  { path: '/adivina-el-intruso', name: 'AdivinaElIntruso', component: () => import('../views/AdivinaElIntruso.vue') },
  { path: '/rodle', name: 'Rodle', component: () => import('../views/Rodle.vue') },
  { path: '/preguntas-respuestas', name: 'PreguntasYRespuestas', component: () => import('../views/PreguntasRespuestas.vue') },
  { path: '/venta-jugadores', name: 'VentaJugadores', component: () => import('../views/VentaJugadores.vue') },
  { path: '/el-11-historico', name: 'El11Historico', component: () => import('../views/El11Historico.vue') } // ← Nueva ruta
];

const router = createRouter({
  history: createWebHashHistory(), // Modo hash
  routes,
});

export default router;
