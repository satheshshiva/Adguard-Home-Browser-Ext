<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-img
        src="icon/icon_raw.png"
        style="height: 150px"
        class="justify-center ma-5"
        contain
      />
      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          link
          to="/"
          :prepend-icon="mdiCog"
          :title="translate(I18NOptionKeys.options_settings)"
        ></v-list-item>
        <v-list-item
          link
          to="/about"
          :prepend-icon="mdiInformationOutline"
          :title="translate(I18NOptionKeys.options_about)"
        ></v-list-item>
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
import { defineComponent } from 'vue'
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
      mdiFire,
    }
  },
})
</script>
