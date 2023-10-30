<template>
  <v-select
    v-model="disableTime"
    :label="translate(I18NPopupKeys.popup_status_card_select_text)"
    :items="disablePeriodSelect"
    item-text="title"
    item-value="value"
  ></v-select>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@vue/composition-api'
import {
  AdGuardSettingsDefaults,
  StorageService
} from '../../../../service/StorageService'
import useTranslation from '../../../../hooks/translation'
import { I18NPopupKeys } from "../../../../service/i18NService";

export default defineComponent({
  name: 'OptionGenericCheckboxComponent',
  setup: () => {
    const { translate, I18NOptionKeys } = useTranslation()
    const disableTime = ref(AdGuardSettingsDefaults.default_disable_time)
    const disablePeriodSelect = ref([
      {title:'∞ Until turned on', value:2},
      {title:'30 secs', value:30*1000},
      {title:'1 min', value:60*1000},
      {title:'10 min', value:10*60*1000},
      {title:'1 hr', value:60*60*1000},
      {title:'24 hrs', value:24*60*60*1000},
    ]);

    const updateDisableTime = () => {
      StorageService.getDefaultDisableTime().then(time => {
        if (typeof time !== 'undefined') {
          disableTime.value = time
        }
      })
    }

    watch(disableTime, () => {
        StorageService.saveDefaultDisableTime(Number(disableTime.value))
    })

    onMounted(() => updateDisableTime())

    return { translate, I18NOptionKeys, disableTime, console, disablePeriodSelect}
  },
  computed: {
    I18NPopupKeys() {
      return I18NPopupKeys
    }
  },
})
</script>
