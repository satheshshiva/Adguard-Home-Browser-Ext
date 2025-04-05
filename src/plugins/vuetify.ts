import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

let darkTheme = false

if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  darkTheme = true
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: darkTheme ? 'dark' : 'light',
    themes: {
      dark: {
        colors: {
          primary: '#ff5023',
          secondary: '#91dc5a',
          accent: '#3f51b5',
          error: '#e91e63',
          warning: '#ffeb3b',
          info: '#607d8b',
          success: '#4caf50'
        }
      },
      light: {
        colors: {
          primary: '#ff5023',
          secondary: '#91dc5a',
          accent: '#3f51b5',
          error: '#e91e63',
          warning: '#ffeb3b',
          info: '#607d8b',
          success: '#4caf50'
        }
      }
    }
  }
})

export default vuetify
