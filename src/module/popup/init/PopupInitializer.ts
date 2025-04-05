import { createApp } from 'vue'
import PopupComponent from '../vue/view/PopupComponent.vue'
import vuetify from '../../../plugins/vuetify'

document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = createApp(PopupComponent)
    app.use(vuetify)
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize popup:', error)
  }
})
