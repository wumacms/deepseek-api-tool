import { createApp } from 'vue'
import { initTheme } from './composables/useTheme'
import './style.css'
import App from './App.vue'

// 在 createApp 之前初始化主题，防止 FOUC (Flash of Unstyled Content)
initTheme()

createApp(App).mount('#app')
