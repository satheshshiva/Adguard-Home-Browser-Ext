export interface AdGuardSettingsStorage {
  adguard_uri_base?: string
  username?: string
  password?: string
}

export enum AdGuardSettingsDefaults {
  adguard_uri_base = 'http://adguard/',
  default_disable_time = 30000
}

export interface ExtensionStorage {
  adguard_settings?: AdGuardSettingsStorage[]
  default_disable_time?: number
  reload_after_disable?: boolean
  disable_list_feature?: boolean
  beta_feature_flag?: boolean
  disable_context_menu?: boolean
}

export enum ExtensionStorageEnum {
  adguard_settings = 'adguard_settings',
  default_disable_time = 'default_disable_time',
  reload_after_disable = 'reload_after_disable',
  disable_list_feature = 'disable_list_feature',
  disable_update_notification = 'disable_update_notification',
  disable_context_menu = 'disable_context_menu'
}

export class StorageService {
  public static saveAdGuardSettingsArray(
    settings: AdGuardSettingsStorage[]
  ): void {
    if (settings.length > 0) {
      const filteredSettings: AdGuardSettingsStorage[] = settings.filter(
        value => value.adguard_uri_base
      )

      if (filteredSettings.length < 1) {
        chrome.storage.local.remove(ExtensionStorageEnum.adguard_settings)
        return
      }

      const secureSettings: AdGuardSettingsStorage[] = []

      // Type Assertion
      for (const setting of filteredSettings) {
        const secureSetting: AdGuardSettingsStorage = {}

        secureSetting.adguard_uri_base = String(setting.adguard_uri_base)
        secureSetting.username = String(setting.username)
        secureSetting.password = String(setting.password)

        secureSettings.push(secureSetting)
      }

      const storage: ExtensionStorage = {
        adguard_settings: secureSettings
      }

      chrome.storage.local.set(storage)
    }
  }

  public static saveDefaultDisableTime(time: number): void {
    if (time < 1) {
      return
    }
    const storage: ExtensionStorage = {
      default_disable_time: time
    }
    chrome.storage.local.set(storage)
  }

  public static getDefaultDisableTime(): Promise<number | undefined> {
    return this.getStorageValue<number>(
      ExtensionStorageEnum.default_disable_time
    )
  }

  public static saveReloadAfterDisable(state: boolean): void {
    const storage: ExtensionStorage = {
      reload_after_disable: state
    }
    chrome.storage.local.set(storage)
  }

  public static getReloadAfterDisable(): Promise<boolean | undefined> {
    return this.getStorageValue<boolean>(
      ExtensionStorageEnum.reload_after_disable
    )
  }

  public static getAdGuardSettingsArray(): Promise<
    AdGuardSettingsStorage[] | undefined
  > {
    return this.getStorageValue<AdGuardSettingsStorage[]>(
      ExtensionStorageEnum.adguard_settings
    )
  }

  public static getDisableUpdateNotification(): Promise<boolean | undefined> {
    return this.getStorageValue<boolean>(
      ExtensionStorageEnum.disable_update_notification
    )
  }

  public static getDisableContextMenu(): Promise<boolean> {
    return this.getStorageValue<boolean>(
      ExtensionStorageEnum.disable_context_menu,
      false
    )
  }

  public static saveDisableContextMenu(state: boolean): void {
    const storage: ExtensionStorage = {
      disable_context_menu: state
    }
    chrome.storage.local.set(storage)
  }

  private static getStorageValue<T>(
    key: ExtensionStorageEnum
  ): Promise<T | undefined>
  private static getStorageValue<T>(
    key: ExtensionStorageEnum,
    defaultUnsetValue: T
  ): Promise<T>
  private static getStorageValue<T>(
    key: ExtensionStorageEnum,
    defaultUnsetValue?: T
  ): Promise<T | undefined> | Promise<T> {
    return new Promise(resolve => {
      chrome.storage.local.get(key, obj => {
        const storageValue: T | undefined = obj[key]

        if (
          typeof defaultUnsetValue !== 'undefined' &&
          typeof storageValue === 'undefined'
        ) {
          resolve(defaultUnsetValue)
        }

        resolve(storageValue)
      })
    })
  }
}
