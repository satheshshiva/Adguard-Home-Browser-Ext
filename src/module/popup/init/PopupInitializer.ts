import { createApp } from 'vue'
import { Initializer } from '../../general/Initializer'
import PopupComponent from '../vue/view/PopupComponent.vue'
import vuetify from '../../../plugins/vuetify'

export default class PopupInitializer implements Initializer {
  init(): void {
    createApp(PopupComponent).use(vuetify).mount('#main')
  }
}
