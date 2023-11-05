import { AdGuardApiStatus } from '../api/models/AdGuardApiStatus'
import { AdGuardSettingsStorage, StorageService } from './StorageService'
import { AdGuardVersion } from '../api/models/AdGuardVersion'
import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'

const statusEndpoint = 'control/status'
const changeStatusEndpoint="control/protection"

export default class AdGuardApiService {
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
        AdGuardApiService.httpGet<AdGuardApiStatus>(url, true, adguard.username, adguard.password)
      )
    }

    return Promise.all(promiseArray)
  }

  /**
   * Get AdGuard Server versions of all instances
   */
  public static async getAdGuardVersions(): Promise<AdGuardVersion[]>
  {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
       return Promise.reject("AdGuard settings empty");
    }
    const adGuardVersionArr = new Array<AdGuardVersion>()

    for (const instance of adGuardSettingsArray) {
      adGuardVersionArr.push(await this.getAdGuardVersion(instance))
    }

    return Promise.all(adGuardVersionArr);
  }

  /**
   * Get AdGuard server Version
   * @param adGuard
   */
  public static async getAdGuardVersion(
    adGuard: AdGuardSettingsStorage
  ): Promise<AdGuardVersion>{
    if (
      typeof adGuard.adguard_uri_base === 'undefined' ||
      typeof adGuard.username === 'undefined' ||
      typeof adGuard.password === 'undefined'
    ) {
      return Promise.reject('Some AdGuardSettings are undefined.')
    }
    const url = this.getAdGuardBaseUrl(adGuard.adguard_uri_base, statusEndpoint)

    //return axios.get<AdGuardVersion>(url.href, this.getAxiosConfig(adGuard.username, adGuard.password))
    return AdGuardApiService.httpGet<AdGuardVersion>(url, true, adGuard.username, adGuard.password);
  }

  private static httpGet<T>( url:URL, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, AdGuardApiService.httHeadersGet(u, p)).then(async (r) => {
        let str = await new Response(r.body).text();
        str = str?str.trim():str;
        if(!jsonResponse){
          resolve(<T>str);
        }
        try{
          let b = JSON.parse(str);
          resolve(<T>b);
        }catch{
          reject(<T>str);
        } }).catch(e => {
          reject(e);
      });
    });
  }

  private static httpPost<T>( url:URL, body:string, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, AdGuardApiService.httHeadersPost(body, u, p)).then(async (r) => {
        let str = await new Response(r.body).text();
        str = str?str.trim():str;
        if(!jsonResponse){
          resolve(<T>str);
        }
        try{
          let b = JSON.parse(str);
          resolve(<T>b);
        }catch{
          reject(<T>str);
        } }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * Change AdGuard Status
   * @param mode
   * @param time
   */
  public static async changeAdGuardStatus(
    mode: AdGuardApiStatusEnum,
    time: number
  ): Promise<string[]> {

    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    if (time < 0) {
      return Promise.reject(`Disable time smaller than allowed:${time}`)
    }

    const promiseArray = new Array<Promise<string>>()

    for (const adguard of adGuardSettingsArray) {
      if (
        typeof adguard.adguard_uri_base === 'undefined' ||
        typeof adguard.username === 'undefined' ||
        typeof adguard.password === 'undefined'
      ) {
        return Promise.reject('Some AdGuardSettings are undefined.')
      }

      const url = this.getAdGuardBaseUrl(adguard.adguard_uri_base, changeStatusEndpoint)
      let data
      if (mode === AdGuardApiStatusEnum.disabled) {
        data = {enabled: false,
          duration: +time}
      } else if (mode === AdGuardApiStatusEnum.enabled) {
        data = {enabled: true}
      } else {
        return Promise.reject(`Mode ${mode} not allowed for this function.`)
      }

      promiseArray.push(
          AdGuardApiService.httpPost<string>(url, JSON.stringify(data), false, adguard.username, adguard.password)
            )
    }

    return Promise.all(promiseArray)
  }

  private static httHeadersGet(u:string, p:string)   {
    return {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Basic ' + btoa(`${u}:${p}`),
      }
    }
  }

  private static httHeadersPost(body:string, u:string, p:string)   {
    return {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${u}:${p}`),
      },
    }
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
