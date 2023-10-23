<template>
  <div>
    <h1 class="mb-5">
      <v-list-item>
        <v-list-item-avatar>
          <v-img src="icon/icon-128.png"   />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h5">
            AdGuard Home
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </h1>

    <h2 class="mb-5">
      {{ translate(I18NOptionKeys.options_about) }}
    </h2>
    <OptionAboutExtension class="mb-5" />
    <OptionAboutReportIssue />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useTranslation from '../../../../hooks/translation'
import OptionAboutReportIssue from '../about/OptionAboutReportIssue.vue'
import OptionAboutExtension from '../about/OptionAboutExtension.vue'

export default defineComponent({
  name: 'OptionAboutTab',
  components: {
    OptionAboutReportIssue,
    OptionAboutExtension
  },
  setup: () => ({ ...useTranslation() })
})
</script>
