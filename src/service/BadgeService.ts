import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'

export enum ExtensionBadgeTextEnum {
  enabled = 'On',
  disabled = 'Off',
  error = 'Err',
  ok = 'Ok'
}

/**
 * Service Module for the extension icon badge.
 */
export class BadgeService {
  /**
   * Sets the badge text.
   */
  public static setBadgeText(text: ExtensionBadgeTextEnum | string): void {
    let action = chrome.action?chrome.action:chrome.browserAction;
    // Firefox needs white text color.
    if (typeof browser !== 'undefined' && browser.browserAction) {
      browser.browserAction.setBadgeTextColor({ color: 'white' }).then()
    }

    action.setBadgeBackgroundColor({
      color: this.getColorForBadgeTextEnum(text)
    })

    action.setBadgeText({ text })
  }

  /**
   * Returns the badge text as enum value.
   */
  public static getBadgeText(): Promise<ExtensionBadgeTextEnum> {
    let action = chrome.action?chrome.action:chrome.browserAction;
    return new Promise(resolve => {
      action.getBadgeText({}, (result: string) => {
        resolve(this.convertStringToBadgeTextEnum(result))
      })
    })
  }

  /**
   * Compares the badge text with the AdGuardApiStatus
   * Returns false if they are not equal
   */
  public static compareBadgeTextToApiStatusEnum(
    badge_text: ExtensionBadgeTextEnum,
    api_status: AdGuardApiStatusEnum
  ): boolean {
    switch (badge_text) {
      case ExtensionBadgeTextEnum.disabled:
        return api_status === AdGuardApiStatusEnum.disabled
      case ExtensionBadgeTextEnum.enabled:
        return api_status === AdGuardApiStatusEnum.enabled
      default:
        return false
    }
  }

  /**
   * Converts an input string to the correct ExtensionBadgeText Enum
   */
  private static convertStringToBadgeTextEnum(
    input: string
  ): ExtensionBadgeTextEnum {
    switch (input) {
      case ExtensionBadgeTextEnum.disabled:
        return ExtensionBadgeTextEnum.disabled
      case ExtensionBadgeTextEnum.enabled:
        return ExtensionBadgeTextEnum.enabled
      default:
        return ExtensionBadgeTextEnum.error
    }
  }

  private static getColorForBadgeTextEnum(
    input: ExtensionBadgeTextEnum | string
  ): string {
    switch (input) {
      case ExtensionBadgeTextEnum.disabled:
        return 'gray'
      case ExtensionBadgeTextEnum.enabled:
        return '#1ea23d'
      case ExtensionBadgeTextEnum.ok:
        return '#4577d7'
      default:
        return 'red'
    }
  }
}
