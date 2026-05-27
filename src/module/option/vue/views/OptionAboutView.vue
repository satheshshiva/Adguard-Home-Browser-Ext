<template>
  <div>
    <h1 class="mb-5">
      <v-list-item title="AdGuard Home">
        <template #prepend>
          <v-avatar>
            <v-img src="icon/icon-128.png" />
          </v-avatar>
        </template>
      </v-list-item>
    </h1>

    <h2 class="mb-5">
      {{ translate(I18NOptionKeys.options_about) }}
    </h2>
    <OptionAboutExtension class="mb-5" />
    <OptionAboutReportIssue class="mb-5" />
    <OptionAboutDisclaimer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useTranslation from '../../../../hooks/translation'
import OptionAboutReportIssue from '../about/OptionAboutReportIssue.vue'
import OptionAboutExtension from '../about/OptionAboutExtension.vue'
import OptionAboutDisclaimer from '../about/OptionAboutDisclaimer.vue'

export default defineComponent({
  name: 'OptionAboutTab',
  components: {
    OptionAboutDisclaimer,
    OptionAboutReportIssue,
    OptionAboutExtension,
  },
  setup: () => ({ ...useTranslation() }),
})
</script>
