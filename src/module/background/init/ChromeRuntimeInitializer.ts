import { Initializer } from '../../general/Initializer'
import {
  AdGuardSettingsDefaults,
  StorageService
} from '../../../service/StorageService'

export default class ChromeRuntimeInitializer implements Initializer {
  public init(): void {
    chrome.runtime.onInstalled.addListener(details => {
      if (details.reason === 'install') {
        StorageService.saveDefaultDisableTime(
          Number(AdGuardSettingsDefaults.default_disable_time)
        )
        StorageService.saveReloadAfterDisable(true)
      } else if (details.reason === 'update' && details.previousVersion) {
        const previousVersion = Number(
          details.previousVersion.split('.').join('')
        )
        const thisVersion = Number(
          chrome.runtime
            .getManifest()
            .version.split('.')
            .join('')
        )
        console.log(`Updated from ${previousVersion} to ${thisVersion}!`)
      }
    })

  }
}
