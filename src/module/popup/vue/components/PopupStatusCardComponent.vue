<template>
  <v-card>
    <v-card-title class="justify-space-between">
      {{ translate(I18NPopupKeys.popup_status_card_title) }}
      <v-icon
        right
        :title="translate(I18NOptionKeys.options_settings)"
        @click="openOptions"
        >{{ mdiCog }}
      </v-icon>
    </v-card-title>
    <v-card-text>
      <div class="d-flex flex justify-center">
        <v-switch
          v-model="sliderChecked"
          style="transform: scale(1.5)"
          inset
          color="green"
          :disabled="sliderDisabled"
          @change="sliderClicked()"
        ></v-switch>
      </div>
      <div class="d-flex flex justify-center">
        <h4 v-if="!sliderDisabled && sliderChecked">
          Protection is enabled
        </h4>
        <h4 v-if="!sliderDisabled && !sliderChecked">
          Protection is disabled
        </h4>
      </div>
      <div  v-if="protectionDisabledDuration>0" class="d-flex flex justify-center mt-2">
        <h5 >Enabling protection in {{protectionDisabledDuration}}ms</h5>
      </div>
      <v-divider class="border-opacity-100 mt-5 mb-5" color="primary"></v-divider>
      <v-text-field
        v-model="defaultDisableTime"
        :disabled="defaultDisableTimeDisabled"
        type="number"
        min="0"
        outlined
        :rules="[v => typeof v === 'number' || v >= 0]"
        :suffix="defaultDisableTime > 0 ? 's' : ''"
        :append-icon="timeUnitIcon"
      >
        <template #label>
          {{ translate(I18NPopupKeys.popup_status_card_info_text) }}
        </template>
      </v-text-field>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mdiAllInclusive, mdiCog, mdiTimerOutline } from '@mdi/js'
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'
import {
  AdGuardSettingsDefaults,
  StorageService
} from '../../../../service/StorageService'
import {
  BadgeService,
  ExtensionBadgeTextEnum
} from '../../../../service/BadgeService'
import TabService from '../../../../service/TabService'
import AdGuardApiService from '../../../../service/AdGuardApiService'
import AdGuardApiStatusEnum from '../../../../api/enum/AdGuardApiStatusEnum'
import useTranslation from '../../../../hooks/translation'

export default defineComponent({
  name: 'PopupStatusCardComponent',
  model: { prop: 'isActiveByStatus', event: 'updateStatus' },
  props: {
    isActiveByStatus: {
      type: Boolean,
      required: true
    },
    isActiveByBadge: {
      type: Boolean,
      required: true
    }
  },
  setup: (props, { emit }) => {
    const sliderChecked = ref(props.isActiveByBadge)
    const sliderDisabled = ref(!props.isActiveByBadge)
    const defaultDisableTimeDisabled = ref(!props.isActiveByBadge)
    const protectionDisabledDuration = ref(0)
    const defaultDisableTime = ref<number>(
      AdGuardSettingsDefaults.default_disable_time
    )

    const timeUnitIcon = computed(() =>
      defaultDisableTime.value < 1 ? mdiAllInclusive : mdiTimerOutline
    )

    const updateDefaultDisableTime = () => {
      StorageService.getDefaultDisableTime().then(time => {
        if (typeof time !== 'undefined') {
          defaultDisableTime.value = time
        }
      })
    }

    const updateComponentsByData = (currentStatus: AdGuardApiStatusEnum) => {
      if (currentStatus === AdGuardApiStatusEnum.disabled) {
        defaultDisableTimeDisabled.value = true
        sliderChecked.value = false
        sliderDisabled.value = false
        BadgeService.setBadgeText(ExtensionBadgeTextEnum.disabled)
        emit('updateStatus', false)
      } else if (currentStatus === AdGuardApiStatusEnum.enabled) {
        defaultDisableTimeDisabled.value = false
        sliderDisabled.value = false
        sliderChecked.value = true
        BadgeService.setBadgeText(ExtensionBadgeTextEnum.enabled)
        emit('updateStatus', true)
      } else {
        defaultDisableTimeDisabled.value = true
        sliderDisabled.value = true
        sliderChecked.value = false
        BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
        emit('updateStatus', false)
      }
    }

    const checkProtectionDuration =() => {
      AdGuardApiService.getAdGuardStatus().then(status => {
        if (status?.length > 0) {
          // here am hardcoding to get the status of only the first instance.
          if (status[0].data.protection_disabled_duration > 0) {
            console.log(
              `status[0].data.protection_disabled_duration::${status[0].data.protection_disabled_duration}`
            )
            protectionDisabledDuration.value = status[0].data.protection_disabled_duration;
            return;
          }
        }
        protectionDisabledDuration.value=0;
        }
      )
    }

    /**
     * Update status of all the UI components. Called when the popup is initialized.
     */
    const updateStatus = async () => {
      const isEnabledByBadge =
        (await BadgeService.getBadgeText()) === ExtensionBadgeTextEnum.enabled

      if (isEnabledByBadge) {
        sliderChecked.value = true
        sliderDisabled.value = false
        defaultDisableTimeDisabled.value = false
      }

      AdGuardApiService.getAdGuardStatusCombined()
        .then(value => {
          updateComponentsByData(value)
          // if the current status is disabled then if there is a protection_disabled_duration available
          if (value === AdGuardApiStatusEnum.disabled) {
            checkProtectionDuration();
          }
        })
        .catch(() => updateComponentsByData(AdGuardApiStatusEnum.error))
    }

    // const getProtectionDisabledDuration = computed( () =>{
    //   console.log(`SUPER ${protectionDisabledDuration.value}`  )
    //   return String(protectionDisabledDuration.value);
    // })

    const onSliderClickSuccessHandler = () => {
      AdGuardApiService.getAdGuardStatusCombined()
        .then(data => {
          updateComponentsByData(data)
          checkProtectionDuration();
          if (data === AdGuardApiStatusEnum.disabled) {
            const reloadAfterDisableCallback = (
              is_enabled: boolean | undefined
            ) => {
              if (typeof is_enabled !== 'undefined' && is_enabled) {
                TabService.reloadCurrentTab(1000)
              }
            }
            StorageService.getReloadAfterDisable().then(
              reloadAfterDisableCallback
            )
          }
        })
        .catch(() => updateComponentsByData(AdGuardApiStatusEnum.error))
    }

    const throwConsoleBadgeError = (
      error_message: string,
      refresh_status: boolean = false
    ) => {
      console.warn(error_message)

      updateComponentsByData(AdGuardApiStatusEnum.error)
      if (refresh_status) {
        setTimeout(() => {
          AdGuardApiService.getAdGuardStatusCombined()
            .then(data => updateComponentsByData(data))
            .catch(() => updateComponentsByData(AdGuardApiStatusEnum.error))
        }, 1500)
      }
    }

    const openOptions = () => {
      // eslint-disable-next-line no-undef
      chrome.runtime.openOptionsPage()
    }

    const sliderClicked = () => {
      const currentMode = sliderChecked.value
        ? AdGuardApiStatusEnum.enabled
        : AdGuardApiStatusEnum.disabled

      const time: number = defaultDisableTime.value

      if (time >= 0) {
        AdGuardApiService.changeAdGuardStatus(currentMode, time)
          .then(value => {
            for (const adGuardStatus of value) {
              if (adGuardStatus.data !== 'OK') {
                throwConsoleBadgeError(
                  `Change status failed in one or more adGuard instance(s): Error:${adGuardStatus.data}`,
                  true
                )
                return
              }
            }
            onSliderClickSuccessHandler()
          })
          .catch(reason => {
            throwConsoleBadgeError(reason)
          })
      } else {
        throwConsoleBadgeError(
          'Time cannot be smaller than 0. Canceling api request.',
          true
        )
      }
    }

    onMounted(() => {
      updateDefaultDisableTime()
      updateStatus()
    })

    return {
      defaultDisableTime,
      defaultDisableTimeDisabled,
      protectionDisabledDuration,
      sliderChecked,
      sliderDisabled,
      timeUnitIcon,
   //   getProtectionDisabledDuration,
      mdiCog,
      sliderClicked,
      openOptions,
      ...useTranslation()
    }
  }
})
</script>