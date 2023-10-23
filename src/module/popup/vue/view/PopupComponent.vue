<template>
  <v-app id="popup">
    <v-container fluid>
      <PopupStatusCardComponent
        v-if="isActiveByBadgeLoaded"
        v-model="isActiveByRealStatus"
        :is-active-by-badge="isActiveByBadge"
        class="mb-5"
      />
      <PopupUpdateAlertComponent v-if="!isActiveByRealStatus" />
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import PopupStatusCardComponent from '../components/PopupStatusCardComponent.vue'
import {
  BadgeService,
  ExtensionBadgeTextEnum
} from '../../../../service/BadgeService'
import PopupUpdateAlertComponent from '../components/PopupUpdateAlertComponent.vue'
import TabService from '../../../../service/TabService'

export default defineComponent({
  name: 'PopupComponent',
  components: {
    PopupUpdateAlertComponent,
    PopupStatusCardComponent
  },
  setup: () => {
    const isActiveByBadge = ref(false)
    const isActiveByBadgeLoaded = ref(false)
    const isActiveByRealStatus = ref(false)
    const currentUrl = ref('')

    const updateIsActiveByBadge = async () => {
      const badgeText = await BadgeService.getBadgeText()

      isActiveByBadge.value = badgeText === ExtensionBadgeTextEnum.enabled
      isActiveByBadgeLoaded.value = true
    }

    const updateCurrentUrl = async () => {
      const currentUrlLoaded = await TabService.getCurrentTabUrlCleaned()
      if (currentUrlLoaded.length > 0) {
        currentUrl.value = currentUrlLoaded
      }
    }


    onMounted(() => {
      updateIsActiveByBadge()
      updateCurrentUrl()
    })

    return {
      currentUrl,
      isActiveByBadge,
      isActiveByBadgeLoaded,
      isActiveByRealStatus,
    }
  }
})
</script>

<style lang="scss">
#popup {
  width: 250px;
}
</style>
