<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list-item>
        <v-list-item-avatar>
          <v-img height="60px" src="icon/icon-128.png"  contain />
        </v-list-item-avatar>
<!--        <v-list-item-content>-->
<!--          <v-list-item-title class="text-h6">-->
<!--            AdGuard Home-->
<!--            <br />Browser <br />Extension-->
<!--          </v-list-item-title>-->
<!--        </v-list-item-content>-->
      </v-list-item>

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
      <v-container fluid style="max-width: 800px">
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
