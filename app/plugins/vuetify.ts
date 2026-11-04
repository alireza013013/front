import '@mdi/font/css/materialdesignicons.css'
import { VStepperVertical } from 'vuetify/labs/VStepperVertical'
// Import from Vuetify components
import { VSlideGroup } from 'vuetify/components'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases as mdiAliases, mdi } from 'vuetify/iconsets/mdi'
import { mdSymbols, mdSymbolsFull } from '../utils/iconsets/mdSymbols'
import { defineNuxtPlugin } from 'nuxt/app'
import { DARK_THEME_COLORS, LIGHT_THEME_COLORS } from '@/constants/theme'
import { getInitialTheme } from '@/composables/useThemeMode'

export default defineNuxtPlugin(
  (nuxtApp) => {
    const vuetify = createVuetify({
      ssr: true,
      theme: {
        defaultTheme: getInitialTheme(),
        variations: {
          colors: ['primary'],
          lighten: 0,
          darken: 1,
        },
        themes: {
          light: {
            dark: false,
            colors: LIGHT_THEME_COLORS,
          },
          dark: {
            dark: true,
            colors: DARK_THEME_COLORS,
          },
        },
      },
      icons: {
        defaultSet: 'mdi',
        aliases: {
          ...mdiAliases,
        },
        sets: {
          mdi,
          md: mdSymbols,
          mdfull: mdSymbolsFull,
        },
      },
      components: {
        VStepperVertical,
        VSlideGroup,
      },
    })
    nuxtApp.vueApp.use(vuetify)
  },
)
