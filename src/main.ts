import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

console.log('Application starting...')

const app = createApp(App)

console.log('Creating Pinia store...')
app.use(createPinia())

console.log('Setting up router...')
app.use(router)

console.log('Mounting application...')
app.mount('#app')

console.log('Application mounted successfully')