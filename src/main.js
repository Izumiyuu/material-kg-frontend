import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/mn/manage.css'
import './assets/kg/common.css'
import './assets/qa/chat.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')