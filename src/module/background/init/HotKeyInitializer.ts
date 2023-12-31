import { Initializer } from '../../general/Initializer'
import BackgroundService from '../../../service/BackgroundService'

enum HotKeyEnum {
  hotkey_toggle_adguard = 'hotkey-toggle-adguard',
  hotkey_blacklist_current_domain = 'hotkey-blacklist-current-domain',
  hotkey_whitelist_current_domain = 'hotkey-whitelist-current-domain',
  hotkey_open_settings = 'hotkey-open-settings'
}

export default class HotKeyInitializer implements Initializer {
  init() {
    chrome.commands.onCommand.addListener(command => {
      switch (command) {
        case HotKeyEnum.hotkey_toggle_adguard:
          BackgroundService.toggleInstance()
          break
        case HotKeyEnum.hotkey_open_settings:
          BackgroundService.openOptions()
          break
        default:
      }
    })
  }
}
