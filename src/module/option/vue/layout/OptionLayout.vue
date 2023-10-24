<template>
  <v-app>
    <v-navigation-drawer app>
          <v-img  src="icon/icon_raw.png" style="height: 150px" class="justify-center ma-5" contain />
      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item link to="/">
          <v-list-item-icon>
            <v-icon>{{ mdiCog }}</v-icon>
            ️
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title
              >{{ translate(I18NOptionKeys.options_settings) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/about">
          <v-list-item-icon>
            <v-icon>{{ mdiInformationOutline }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title
              >{{ translate(I18NOptionKeys.options_about) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

    </v-navigation-drawer>
    <v-main>
      <v-container fluid style="max-width: 800px;">
        <router-view></router-view>
      </v-container>
    </v-main>

  </v-app>
</template>

<script lang="ts">
import {  defineComponent } from '@vue/composition-api'
import { mdiCog, mdiFire, mdiGift, mdiInformationOutline } from '@mdi/js'
import useTranslation from '../../../../hooks/translation'

export default defineComponent({
  name: 'OptionComponent',
  setup: () => {
    const { translate, LinkConfig, I18NOptionKeys } = useTranslation()

    return {
      translate,
      LinkConfig,
      I18NOptionKeys,
      mdiCog,
      mdiInformationOutline,
      mdiGift,
      mdiFire
    }
  }
})
</script>
