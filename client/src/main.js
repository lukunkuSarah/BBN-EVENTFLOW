import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Restaure la session AVANT d'installer le routeur, sinon la première
// navigation (ex. rechargement sur /dashboard) voit un utilisateur déconnecté
// et le renvoie vers /login.
useAuthStore(pinia).hydrate()

app.use(router)
app.mount('#app')
