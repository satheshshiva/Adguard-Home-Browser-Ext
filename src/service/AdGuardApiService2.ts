import { AdGuardApiStatus } from '../api/models/AdGuardApiStatus'
import { StorageService } from './StorageService'
import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'
import HttpService from "./HttpService";

const statusEndpoint = 'control/status'

/**
 * This is same as the AdGuardApiService. When I use the AdGuardApiService in chrome service worker, the worker does not work. It does not output anything in the console. 
 * Probably due to a bug in chromium.
 */
export default class AdGuardApiService2 {

  /**
   * Get AdGuard server status of all the instances
   */
  public static async getAdGuardStatusCombined(): Promise<AdGuardApiStatusEnum> {
    return new Promise<AdGuardApiStatusEnum>(resolve => {
      this.getAdGuardStatus()
        .then(results => {
          for (const result of results) {
            if(!result.protection_enabled) {
            // If any AdGuard instance is offline or has an error we use its status
              resolve(AdGuardApiStatusEnum.disabled)
            }
            resolve(AdGuardApiStatusEnum.enabled)
          }
        })
        .catch(reason => {
          console.warn(reason)
          resolve(AdGuardApiStatusEnum.error)
        })
    })
  }

   /**
   * Get AdGuard server status
   */
   public static async getAdGuardStatus(): Promise<AdGuardApiStatus[]> {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    const promiseArray = new Array<Promise<AdGuardApiStatus>>()

    for (const adguard of adGuardSettingsArray) {
      if (
        typeof adguard.adguard_uri_base === 'undefined' ||
        typeof adguard.username === 'undefined' ||
        typeof adguard.password === 'undefined'
      ) {
        return Promise.reject('Some AdGuardSettings are undefined.')
      }

      const url = this.getAdGuardBaseUrl(adguard.adguard_uri_base, statusEndpoint)

      promiseArray.push(
        HttpService.get<AdGuardApiStatus>(url, true, adguard.username, adguard.password)
      )
    }

    return Promise.all(promiseArray)
  }

  private static getAdGuardBaseUrl(domain: string, endpoint?: string): URL {
    let domainPrepared = domain
    if (domain.slice(-1) !== '/') {
      domainPrepared += '/'
    }
    let correctEndpoint
    if (typeof endpoint === 'undefined' || endpoint.length < 1) {
      correctEndpoint = ''
    } else {
      correctEndpoint = endpoint
    }
    return new URL(correctEndpoint, domainPrepared)
  }



}