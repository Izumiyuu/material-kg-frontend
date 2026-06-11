import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/mn/manage.css'
import App from './App.vue'
import router from './router'

createApp(App).use(createPinia()).use(router).mount('#app')
