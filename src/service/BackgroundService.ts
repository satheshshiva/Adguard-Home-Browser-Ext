import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'
import { BadgeService, ExtensionBadgeTextEnum } from './BadgeService'
import { AdGuardSettingsDefaults, StorageService } from './StorageService'
import AdGuardApiService from './AdGuardApiService'
import TabService from './TabService'
import ApiList from '../api/enum/ApiList'

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
            for (const piHoleStatus of data) {
              if (
                piHoleStatus.data.status === AdGuardApiStatusEnum.error ||
                piHoleStatus.data.status !== newStatus
              ) {
                console.warn(
                  'One PiHole returned Error from its request. Please check the API Key.'
                )
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

  public static blacklistCurrentDomain(): void {
    TabService.getCurrentTabUrlCleaned().then(url => {
      if (url.length < 1) {
        return
      }
      AdGuardApiService.subDomainFromList(ApiList.whitelist, url)
        .then(() => {
          AdGuardApiService.addDomainToList(ApiList.blacklist, url)
            .then(() => {
              BadgeService.setBadgeText(ExtensionBadgeTextEnum.ok)
            })
            .catch(reason => {
              console.warn(reason)
              BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
            })
        })
        .catch(reason => {
          console.warn(reason)
          BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
        })
    })
  }

  public static whitelistCurrentDomain(): void {
    TabService.getCurrentTabUrlCleaned().then(url => {
      if (url.length < 1) {
        return
      }
      AdGuardApiService.subDomainFromList(ApiList.blacklist, url)
        .then(() => {
          AdGuardApiService.addDomainToList(ApiList.whitelist, url)
            .then(value => {
              StorageService.getReloadAfterWhitelist().then(state => {
                if (typeof state === 'undefined') {
                  return
                }
                if (state) {
                  for (const response of value) {
                    if (response.data.message.includes('Added')) {
                      TabService.reloadCurrentTab(1500)
                    }
                  }
                }
              })
              BadgeService.setBadgeText(ExtensionBadgeTextEnum.ok)
            })
            .catch(reason => {
              console.warn(reason)
              BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
            })
        })
        .catch(reason => {
          console.warn(reason)
          BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
        })
    })
  }

  public static openOptions(): void {
    chrome.runtime.openOptionsPage()
  }
}
