import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddTripView from '../views/AddTripView.vue'
import PhotosView from '../views/PhotosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/add',
      name: 'add',
      component: AddTripView
    },
    {
      path: '/photos',
      name: 'photos',
      component: PhotosView
    }
  ]
})

export default router
