import {
  BadgeService,
  ExtensionBadgeTextEnum
} from '../../../service/BadgeService'
import ContextMenuInitializer from './ContextMenuInitializer'
import ChromeRuntimeInitializer from './ChromeRuntimeInitializer'
import { Initializer } from '../../general/Initializer'
import AdGuardApiService from '../../../service/AdGuardApiService'
import AdGuardApiStatusEnum from '../../../api/enum/AdGuardApiStatusEnum'
import HotKeyInitializer from './HotKeyInitializer'

export default class BackgroundInitializer implements Initializer {
  private readonly INTERVAL_TIMEOUT = 15000

  public init(): void {
    BadgeService.setBadgeText('')

    new ContextMenuInitializer().init()
    new ChromeRuntimeInitializer().init()
    new HotKeyInitializer().init()

    this.checkStatus().then()
    window.setInterval(() => this.checkStatus(), this.INTERVAL_TIMEOUT)
  }

  /**
   * Checking the current status of the AdGuard instance(s)
   */
  private async checkStatus(): Promise<void> {
    AdGuardApiService.getAdGuardStatusCombined().then(value => {
      BadgeService.getBadgeText().then(result => {
        if (!BadgeService.compareBadgeTextToApiStatusEnum(result, value)) {
          if (value === AdGuardApiStatusEnum.disabled) {
            BadgeService.setBadgeText(ExtensionBadgeTextEnum.disabled)
          } else if (value === AdGuardApiStatusEnum.enabled) {
            BadgeService.setBadgeText(ExtensionBadgeTextEnum.enabled)
          }
        }
      })
    })
  }
}
