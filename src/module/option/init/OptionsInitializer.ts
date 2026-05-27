import { createApp, nextTick } from 'vue'
import vueDebounce from 'vue-debounce'
import { createRouter, createWebHashHistory } from 'vue-router'
import { Initializer } from '../../general/Initializer'
import vuetify from '../../../plugins/vuetify'
import { I18NOptionKeys, I18NService } from '../../../service/i18NService'
import OptionLayout from '../vue/layout/OptionLayout.vue'

export default class OptionsInitializer implements Initializer {
  public init(): void {
    const router = createRouter({
      history: createWebHashHistory(),
      routes: [
        {
          path: '/',
          component: () => import('../vue/views/OptionSettingsView.vue'),
          meta: {
            title: I18NService.translate(I18NOptionKeys.options_settings)
          }
        },
        {
          path: '/about',
          component: () => import('../vue/views/OptionAboutView.vue'),
          meta: {
            title: I18NService.translate(I18NOptionKeys.options_about)
          }
        }
      ]
    })

    router.afterEach((to) => {
      nextTick(() => {
        document.title = I18NService.translate(I18NOptionKeys.options_title, [
          (to.meta?.title as string) || ''
        ])
      })
    })

    const app = createApp(OptionLayout)
    app.directive('debounce', vueDebounce({ lock: true }))
    app.use(router)
    app.use(vuetify)
    app.mount('#main')
  }
}
