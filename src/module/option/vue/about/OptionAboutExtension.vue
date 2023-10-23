<template>
  <v-card>
    <v-card-title>
      {{ translate(I18NOptionKeys.option_extension) }}
    </v-card-title>
    <v-card-text>
      <p>Version: {{ extensionVersion }} </p>
      <p>{{ translate('manifest_description') }}</p>
      <br>
      <p>
        <v-btn class="mb-1" @click="openGithubLink">
          {{ translate(I18NOptionKeys.option_github_open) }}
        </v-btn>
        <br />
        <br />
        <br />
        {{copyrightText}}
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import useTranslation from '../../../../hooks/translation'
import { I18NOptionKeys, LinkConfig } from "../../../../service/i18NService";

export default defineComponent({
  name: 'OptionAboutExtension',
  setup: () => {
    const { translate } = useTranslation()
    const copyrightText = computed(() => {
      const year = new Date().getFullYear()
      return `(C) ${year} - Sathesh Sivashanmugam`
    })
    const openGithubLink = () => {
      window.open(LinkConfig.github_url, '_blank')
    }
    const extensionVersion = computed(
      // eslint-disable-next-line no-undef
      () => chrome.runtime.getManifest().version
    )
    return {
      openGithubLink,
      extensionVersion,
      copyrightText,
      translate,
      I18NOptionKeys,
    }
  },
  computed: {
    LinkConfig() {
      return LinkConfig
    }
  },
})
</script>
