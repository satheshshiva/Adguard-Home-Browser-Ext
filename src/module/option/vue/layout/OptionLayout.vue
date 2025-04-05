<template>
  <v-app>
    <v-navigation-drawer app permanent>
      <v-img 
        src="icon/icon_raw.png" 
        class="justify-center ma-5" 
        contain
        max-height="150"
        max-width="150"
      />
      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item 
          link 
          to="/settings"
          :active="$route.path === '/settings'"
          color="primary"
        >
          <template v-slot:prepend>
            <v-icon :icon="mdiCog" />
          </template>

          <v-list-item-title>
            {{ translate(I18NOptionKeys.options_settings) }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item 
          link 
          to="/about"
          :active="$route.path === '/about'"
          color="primary"
        >
          <template v-slot:prepend>
            <v-icon :icon="mdiInformationOutline" />
          </template>

          <v-list-item-title>
            {{ translate(I18NOptionKeys.options_about) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-6">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiCog, mdiInformationOutline } from '@mdi/js'
import useTranslation from '../../../../hooks/translation'
import { I18NOptionKeys } from '../../../../service/i18NService'

export default defineComponent({
  name: 'OptionLayout',
  setup() {
    const { translate } = useTranslation()
    return {
      translate,
      I18NOptionKeys,
      mdiCog,
      mdiInformationOutline
    }
  }
})
</script>

<style scoped>
.v-navigation-drawer {
  background-color: var(--v-background-base) !important;
}

.v-list-item {
  margin: 4px 8px;
  border-radius: 4px;
}

.v-list-item--active {
  background-color: var(--v-primary-lighten1) !important;
}

.v-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
