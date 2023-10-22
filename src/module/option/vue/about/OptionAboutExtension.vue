<template>
  <v-card>
    <v-card-title>
      {{ translate(I18NOptionKeys.option_extension) }}
    </v-card-title>
    <v-card-text>
      <p>{{ translate('manifest_description') }}</p>
      <v-divider />
      <p>
        {{ translate(I18NOptionKeys.option_contributors) }}
        <br />
        <a :href="LinkConfig.github_user_satheshshiva" target="_blank">
          Sathesh Sivashanmugam
        </a>
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useTranslation from '../../../../hooks/translation'

export default defineComponent({
  name: 'OptionAboutExtension',
  setup: () => ({ ...useTranslation() })
})
</script>
