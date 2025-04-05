<template>
    <v-container fluid class="pa-6">
      <div class="d-flex justify-space-between">
        <div class="d-flex justify-start align-center ">
        <v-avatar size="40">
          <v-img src="icon/icon-128.png" />
        </v-avatar>
          <h2>
        {{ translate(I18NPopupKeys.popup_status_card_title) }}
          </h2>
        </div>
        <v-icon
          right
          :title="translate(I18NOptionKeys.options_settings)"
          @click="openOptions"
          >{{ mdiCog }}
        </v-icon>
      </div>
      <div class="d-flex flex justify-center mt-5">
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
      <div
        v-if="protectionDisabledDuration > 0"
        class="d-flex flex justify-center mt-2"
      >
        <h5>
          Enabling protection in {{ beautifyDisabledDuration }}
        </h5>
      </div>
      <v-divider
        class="border-opacity-100 mt-5 mb-5"
        color="primary"
      ></v-divider>

      <v-select
        v-model="defaultDisableTime"
        :label="translate(I18NPopupKeys.popup_status_card_select_text)"
        :disabled="defaultDisableTimeDisabled"
        :items="disablePeriodSelect"
        item-text="title"
        item-value="value"
        @input="onChangeDisableTime()"
      ></v-select>
    </v-container>
</template>
<script lang="ts">
import { mdiAllInclusive, mdiCog, mdiTimerOutline } from '@mdi/js'
import { computed, defineComponent, onMounted, ref } from 'vue'
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
  emits: ['update:isActiveByStatus'],
  setup: (props, { emit }) => {
    const sliderChecked = ref(props.isActiveByBadge)
    const sliderDisabled = ref(!props.isActiveByBadge)
    const defaultDisableTimeDisabled = ref(!props.isActiveByBadge)
    const protectionDisabledDuration = ref(0)
    const beautifyDisabledDuration = ref('')
    const disablePeriodSelect = ref([
      {title:'∞ Until turned on', value:0},
      {title:'30 secs', value:30*1000},
      {title:'1 min', value:60*1000},
      {title:'10 min', value:10*60*1000},
      {title:'1 hr', value:60*60*1000},
      {title:'24 hrs', value:24*60*60*1000},
    ]);

    let intervalId:number;

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
        emit('update:isActiveByStatus', false)
      } else if (currentStatus === AdGuardApiStatusEnum.enabled) {
        defaultDisableTimeDisabled.value = false
        sliderDisabled.value = false
        sliderChecked.value = true
        BadgeService.setBadgeText(ExtensionBadgeTextEnum.enabled)
        emit('update:isActiveByStatus', true)
      } else {
        defaultDisableTimeDisabled.value = true
        sliderDisabled.value = true
        sliderChecked.value = false
        BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
        emit('update:isActiveByStatus', false)
      }
    }
    const showTimerDisabledDuration = () => {
      clearInterval(intervalId);
      let duration = Math.trunc(protectionDisabledDuration.value / 1000);
      const MINUTE=60;
      const HOUR=MINUTE * 60;
      const DAY=HOUR * 24;
      const TIMEOUT=1000;

      const convertString = () =>{
        let str = '';
        let d = duration;
        if (d > DAY) {
          str += `${Math.trunc(d / DAY)}d:`;
          d %= DAY;
        }
        if(d > HOUR){
          str += `${Math.trunc(d / HOUR)}h:`;
          d %= HOUR;
        }
        if(d > MINUTE){
          str += `${Math.trunc(d / MINUTE)}m:`;
          d %= MINUTE;
        }
        if(d>0){
          str+=`${d}s`;
        }
        beautifyDisabledDuration.value = str;
        duration--;
      }

      convertString();
      intervalId = setInterval( () => {
        convertString();
      if(duration <=0){
        clearInterval(intervalId);
      }
      }, TIMEOUT);


    }

    const checkProtectionDuration = () => {
      AdGuardApiService.getAdGuardStatus().then(status => {
        if (status?.length > 0) {
          // here am hardcoding to get the status of only the first instance.
          if (status[0].protection_disabled_duration > 0) {
            protectionDisabledDuration.value = status[0].protection_disabled_duration
            showTimerDisabledDuration()
            return
          }
        }
        protectionDisabledDuration.value = 0;
        showTimerDisabledDuration();
      })
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
            checkProtectionDuration()
          }
        })
        .catch(() => updateComponentsByData(AdGuardApiStatusEnum.error))
    }

    const onSliderClickSuccessHandler = () => {
      AdGuardApiService.getAdGuardStatusCombined()
        .then(data => {
          updateComponentsByData(data)
          checkProtectionDuration()
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
      clearInterval(intervalId);
      protectionDisabledDuration.value=0;

      if (time >= 0) {
        AdGuardApiService.changeAdGuardStatus(currentMode, time)
          .then(value => {
            for (const adGuardStatus of value) {
              if (adGuardStatus !== 'OK') {
                throwConsoleBadgeError(
                  `Change status failed in one or more adGuard instance(s): Error:${adGuardStatus}`,
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
    const onChangeDisableTime = () => {
      sliderChecked.value = false;
      sliderClicked();
    }

    onMounted(() => {
      updateDefaultDisableTime()
      updateStatus()
    })

    return {
      defaultDisableTime,
      disablePeriodSelect,
      onChangeDisableTime,
      defaultDisableTimeDisabled,
      protectionDisabledDuration,
      beautifyDisabledDuration,
      sliderChecked,
      sliderDisabled,
      timeUnitIcon,
      mdiCog,
      sliderClicked,
      openOptions,
      ...useTranslation()
    }
  }
})
</script>