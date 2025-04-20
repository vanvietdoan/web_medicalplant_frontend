import { createRouter, createWebHistory } from 'vue-router';
import FilterLayout from '../FilterLayout.vue';
import listGenus from './listGenus.vue';
import editGenus from './editGenus.vue';

const routes = [
  {
    path: '/filter',
    component: FilterLayout,
    children: [
      {
        path: 'genus',
        name: 'listGenus',
        component: listGenus
      },
      {
        path: 'genus/create',
        name: 'createGenus',
        component: editGenus
      },
      {
        path: 'genus/:id/edit',
        name: 'editGenus',
        component: editGenus,
        props: true
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 