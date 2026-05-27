import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const darkTheme =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

const themeColors = {
  primary: '#ff5023',
  secondary: '#91dc5a',
  accent: '#3f51b5',
  error: '#e91e63',
  warning: '#ffeb3b',
  info: '#607d8b',
  success: '#4caf50'
}

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: darkTheme ? 'dark' : 'light',
    themes: {
      dark: { dark: true, colors: themeColors },
      light: { dark: false, colors: themeColors }
    }
  }
})

export default vuetify
