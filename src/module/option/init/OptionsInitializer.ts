import { createApp } from 'vue'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import OptionLayout from '../vue/layout/OptionLayout.vue'
import OptionSettingsView from '../vue/views/OptionSettingsView.vue'
import OptionAboutView from '../vue/views/OptionAboutView.vue'
import vuetify from '../../../plugins/vuetify'
import { I18NOptionKeys } from '../../../service/i18NService'
import { I18NService } from '../../../service/i18NService'

interface RouteMeta {
  title: string
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: OptionLayout,
    children: [
      {
        path: '',
        redirect: '/settings'
      },
      {
        path: '/settings',
        component: OptionSettingsView,
        meta: {
          title: I18NOptionKeys.options_settings
        }
      },
      {
        path: '/about',
        component: OptionAboutView,
        meta: {
          title: I18NOptionKeys.options_about
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const meta = to.meta as unknown as RouteMeta
  document.title = I18NService.translate(meta?.title || I18NOptionKeys.option_extension)
  next()
})

export default class OptionsInitializer {
  public init(): void {
    try {
      const app = createApp(OptionLayout)
      app.use(router)
      app.use(vuetify)
      app.mount('#app')
    } catch (error) {
      console.error('Failed to initialize options page:', error)
    }
  }
}
