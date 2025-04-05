<template>
  <v-card>
    <v-card-title>
      {{ translate(I18NOptionKeys.option_about_disclaimer) }}
    </v-card-title>
    <v-card-text >
      <span style="font-size: 0.9em;">
        {{ translate(I18NOptionKeys.option_about_disclaimer_message) }}
        <br />
      </span>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import useTranslation from '../../../../hooks/translation'

const { translate } = useTranslation()
</script>
