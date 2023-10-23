<template>
  <v-card>
    <v-card-title>
      {{ translate(I18NOptionKeys.option_about_disclaimer) }}
    </v-card-title>
    <v-card-text>
      <p>
        {{ translate(I18NOptionKeys.option_about_disclaimer_message) }}
        <br />

      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useTranslation from '../../../../hooks/translation'

export default defineComponent({
  name: 'OptionAboutDisclaimer',
  setup: () => ({ ...useTranslation() })
})
</script>
