import { Initializer } from "../../general/Initializer";
import AdGuardApiService from '../../../service/AdGuardApiService'
import AdGuardApiStatusEnum from '../../../api/enum/AdGuardApiStatusEnum'
import { BadgeService, ExtensionBadgeTextEnum } from "../../../service/BadgeService";
export default class CheckStatusInitializer implements Initializer {

  private readonly INTERVAL_TIMEOUT = 0.3;

  public init(): void {
    this.checkStatus().then();
    chrome.alarms.create("BadgeTextStatusChecker", {  periodInMinutes: this.INTERVAL_TIMEOUT });

    chrome.alarms.onAlarm.addListener(() => {
      this.checkStatus().then();
    });

    chrome.runtime.onSuspend.addListener(() => {
      console.warn("Unloading CheckStatusInitializer::");
    });
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
          }else if (value === AdGuardApiStatusEnum.error) {
            BadgeService.setBadgeText(ExtensionBadgeTextEnum.error)
          }
        }
      })
    })
  }
  }