import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'
import { BadgeService, ExtensionBadgeTextEnum } from './BadgeService'
import { AdGuardSettingsDefaults, StorageService } from './StorageService'
import AdGuardApiService from './AdGuardApiService'
import TabService from './TabService'

export default class BackgroundService {
  public static togglePiHole(): void {
    let newStatus: AdGuardApiStatusEnum
    BadgeService.getBadgeText().then(result => {
      if (result === ExtensionBadgeTextEnum.disabled) {
        newStatus = AdGuardApiStatusEnum.enabled
      } else if (result === ExtensionBadgeTextEnum.enabled) {
        newStatus = AdGuardApiStatusEnum.disabled
      } else {
        return
      }

      StorageService.getDefaultDisableTime().then(value => {
        let disableTime = value
        if (typeof disableTime === 'undefined') {
          disableTime = AdGuardSettingsDefaults.default_disable_time
        }

        AdGuardApiService.changeAdGuardStatus(newStatus, disableTime)
          .then(data => {
            for (const changeStatusResponse of data) {
              if (changeStatusResponse.data !== "OK") {
                console.warn(`One AdGuard instance returned Error from its request. Error: ${changeStatusResponse.data}`)
                BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
                return
              }
            }
            BadgeService.setBadgeText(
              newStatus === AdGuardApiStatusEnum.disabled
                ? ExtensionBadgeTextEnum.disabled
                : ExtensionBadgeTextEnum.enabled
            )

            StorageService.getReloadAfterDisable().then(state => {
              if (typeof state !== 'undefined' && state) {
                TabService.reloadCurrentTab(1500)
              }
            })
          })
          .catch(reason => {
            console.warn(reason)
            BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
          })
      })
    })
  }

  public static openOptions(): void {
    chrome.runtime.openOptionsPage()
  }
}
