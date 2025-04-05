<template>
  <div>
    <v-tabs v-model="currentTab">
      <v-tab
        v-for="(adguard_settings, index) in tabs"
        :key="'dyn-tab-' + index"
        @click="resetConnectionCheckAndCheck"
      >
        Instance {{ index + 1 }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="currentTab">
      <v-tab-item
        v-for="(adguard_settings, index) in tabs"
        :key="index"
        class="mt-5"
      >
        <v-text-field
          v-model="adguard_settings.adguard_uri_base"
          v-debounce:500ms="connectionCheck"
          outlined
          debounce-events="input"
          :placeholder="AdGuardSettingsDefaults.adguard_uri_base"
          :rules="[
            v =>
              isInvalidUrlSchema(v) ||
              translate(I18NOptionKeys.options_url_invalid_warning)
          ]"
          :label="translate(I18NOptionKeys.options_pi_hole_address)"
          required
        ></v-text-field>
        <v-text-field
          v-model="adguard_settings.username"
          v-debounce:500ms="connectionCheck"
          outlined
          :label="translate(I18NOptionKeys.options_username)"
        ></v-text-field>
        <v-text-field
          v-model="adguard_settings.password"
          v-debounce:500ms="connectionCheck"
          outlined
          :type="passwordInputType"
          :append-icon="
            passwordInputType === 'password' ? mdiEyeOutline : mdiEyeOffOutline
          "
          
          :label="translate(I18NOptionKeys.options_password)"
          @click:append="toggleApiKeyVisibility"
        ></v-text-field>

        <div class="mb-5">
          <v-btn v-if="tabs.length < 4" @click.prevent="addNewInstance"
            >{{ translate(I18NOptionKeys.options_add_button) }}
          </v-btn>
          <v-btn
            v-if="tabs.length > 1"
            @click.prevent="removeInstance(currentTab)"
            >{{
              translate(I18NOptionKeys.options_remove_button, [
                String(currentTab + 1)
              ])
            }}
          </v-btn>
        </div>
        <v-alert v-if="connectionCheckStatus === 'IDLE'" outlined type="info">
          {{ translate(I18NOptionKeys.option_connection_check_idle) }}
          <v-progress-circular
            color="primary"
            indeterminate
            :size="25"
            :width="2"
          />
        </v-alert>
        <v-alert v-if="connectionCheckStatus === 'OK'" type="success" outlined>
          {{ translate(I18NOptionKeys.option_connection_check_ok) }}<br />
          {{ connectionCheckVersionText }}
        </v-alert>
        <v-alert v-if="connectionCheckStatus === 'ERROR'" outlined type="error">
          {{ translate(I18NOptionKeys.option_connection_check_error) }}<br />
          {{checkErrorMsg()}}
        </v-alert>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { debounce } from 'vue-debounce'
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch
} from 'vue'
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'
import {
  AdGuardSettingsStorage,
  StorageService,
  AdGuardSettingsDefaults
} from '../../../../service/StorageService'
import { AdGuardVersion } from '../../../../api/models/AdGuardVersion'
import AdGuardApiService from '../../../../service/AdGuardApiService'
import useTranslation from '../../../../hooks/translation'

enum ConnectionCheckStatus {
  OK = 'OK',
  ERROR = 'ERROR',
  IDLE = 'IDLE'
}

enum PasswordInputType {
  password = 'password',
  text = 'text'
}

export default defineComponent({
  name: 'OptionTabComponent',
  directives: {
    debounce
  },
  setup: () => {
    const { translate, I18NOptionKeys } = useTranslation()
    const tabs = ref<AdGuardSettingsStorage[]>([
      {
        adguard_uri_base: '',
        username: '',
        password: ''
      }
    ])

    const currentTab = ref(0)
    const passwordInputType = ref<PasswordInputType>(PasswordInputType.password)
    const connectionCheckStatus = ref<ConnectionCheckStatus>(ConnectionCheckStatus.IDLE)
    const errorMsg = ref<string>("null")
    const connectionCheckData = ref<AdGuardVersion | null>(null)

    const currentSelectedSettings = computed(() => tabs.value[currentTab.value])

    const connectionCheck = () => {
      connectionCheckStatus.value = ConnectionCheckStatus.IDLE
      AdGuardApiService.getAdGuardVersion(currentSelectedSettings.value)
        .then(result => {
          if (typeof result === 'object') {
            connectionCheckStatus.value = ConnectionCheckStatus.OK
            connectionCheckData.value = result
            errorMsg.value = ""
          } else {
            connectionCheckStatus.value = ConnectionCheckStatus.ERROR
            errorMsg.value = `Unexpected response from server: ${result}`
          }
        })
        .catch((e) => {
          errorMsg.value = `${e}`
          console.warn(errorMsg.value)
          connectionCheckStatus.value = ConnectionCheckStatus.ERROR
        })
    }

    const resetConnectionCheckAndCheck = () => {
      connectionCheckStatus.value = ConnectionCheckStatus.IDLE
      connectionCheckData.value = null
      debounce(() => {
        connectionCheck()
      }, '300ms')()
    }

    const updateTabsSettings = async () => {
      const results = await StorageService.getAdGuardSettingsArray()
      if (typeof results !== 'undefined' && results.length > 0) {
        tabs.value = results
      }
    }

    onMounted(() => {
      updateTabsSettings().then(() => resetConnectionCheckAndCheck())
    })

    watch(currentTab, () => {
      passwordInputType.value = PasswordInputType.password
    })

    watch(
      tabs,
      () => {
        for (const adGuardSetting of tabs.value) {
          if (typeof adGuardSetting.adguard_uri_base !== 'undefined') {
            adGuardSetting.adguard_uri_base = adGuardSetting.adguard_uri_base.replace(
              /\s+/g,
              ''
            )
          } else {
            adGuardSetting.adguard_uri_base = ''
          }
          if (typeof adGuardSetting.username !== 'undefined') {
            adGuardSetting.username = adGuardSetting.username.replace(/\s+/g, '')
          } else {
            adGuardSetting.username = ''
          }
          if (typeof adGuardSetting.password !== 'undefined') {
            adGuardSetting.password = adGuardSetting.password.replace(/\s+/g, '')
          } else {
            adGuardSetting.password = ''
          }
        }
        StorageService.saveAdGuardSettingsArray(tabs.value)
      },
      { deep: true }
    )

    const checkErrorMsg = () => errorMsg.value

    const connectionCheckVersionText = computed(() => {
      const data = connectionCheckData.value
      return `AdGuard Home Server: ${data?.version}`
    })

    const toggleApiKeyVisibility = () => {
      if (passwordInputType.value === PasswordInputType.password) {
        passwordInputType.value = PasswordInputType.text
      } else {
        passwordInputType.value = PasswordInputType.password
      }
    }

    const addNewInstance = () => {
      resetConnectionCheckAndCheck()
      tabs.value.push({ adguard_uri_base: '', username: '', password: '' })
      setTimeout(() => {
        currentTab.value = tabs.value.length - 1
      }, 0)
    }

    const removeInstance = (index: number) => {
      resetConnectionCheckAndCheck()
      tabs.value.splice(index, 1)
    }

    const isInvalidUrlSchema = (url: string) =>
      !(!url.match('^(http|https):\\/\\/[^ "]+$') || url.length < 1)

    return {
      mdiEyeOutline,
      mdiEyeOffOutline,
      currentTab,
      tabs,
      passwordInputType,
      connectionCheck,
      resetConnectionCheckAndCheck,
      isInvalidUrlSchema,
      removeInstance,
      addNewInstance,
      toggleApiKeyVisibility,
      connectionCheckVersionText,
      checkErrorMsg,
      connectionCheckStatus,
      ConnectionCheckStatus,
      translate,
      I18NOptionKeys,
      AdGuardSettingsDefaults
    }
  }
})
</script>
