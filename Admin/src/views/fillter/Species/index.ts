import { createRouter, createWebHistory } from 'vue-router';
import listSpecies from './listSpecies.vue';
import editSpecies from './editSpecies.vue';

const routes = [
  {
    path: '/species',
    name: 'listSpecies',
    component: listSpecies
  },
  {
    path: '/species/create',
    name: 'createSpecies',
    component: editSpecies
  },
  {
    path: '/species/:id/edit',
    name: 'editSpecies',
    component: editSpecies,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 