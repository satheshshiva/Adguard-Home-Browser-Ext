import {
  I18NOptionKeys,
  I18NPopupKeys,
  I18NService,
  LinkConfig
} from '../service/i18NService'
import { AdGuardSettingsDefaults } from '../service/StorageService'

export default function useTranslation() {
  return {
    I18NPopupKeys,
    I18NOptionKeys,
    AdGuardSettingsDefaults,
    LinkConfig,
    translate: I18NService.translate
  }
}
