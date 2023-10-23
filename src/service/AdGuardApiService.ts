import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AdGuardApiStatus } from '../api/models/AdGuardApiStatus'
import { AdGuardSettingsStorage, StorageService } from './StorageService'
import { AdGuardListStatus } from '../api/models/AdGuardListStatus'
import { AdGuardVersion } from '../api/models/AdGuardVersion'
import ApiListMode from '../api/enum/ApiListMode'
import ApiList from '../api/enum/ApiList'
import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'

const statusEndpoint="control/status"
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
            if(!result.data.protection_enabled) {
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
  public static async getAdGuardStatus(): Promise<
    AxiosResponse<AdGuardApiStatus>[]
  > {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    const promiseArray = new Array<Promise<AxiosResponse<AdGuardApiStatus>>>()

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
        axios.get<AdGuardApiStatus>(url.href, this.getAxiosConfig(adguard.username, adguard.password))
      )
    }

    return Promise.all(promiseArray)
  }

  /**
   * Get AdGuard Server versions of all instances
   */
  public static async getAdGuardVersions(): Promise<
    AxiosResponse<AdGuardVersion>[]
  > {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }
    const promiseArray = new Array<Promise<AxiosResponse<AdGuardVersion>>>()

    for (const instance of adGuardSettingsArray) {
      promiseArray.push(this.getAdGuardVersion(instance))
    }

    return Promise.all(promiseArray)
  }

  /**
   * Get AdGuard server Version
   * @param adGuard
   */
  public static async getAdGuardVersion(
    adGuard: AdGuardSettingsStorage
  ): Promise<AxiosResponse<AdGuardVersion>> {
    if (
      typeof adGuard.adguard_uri_base === 'undefined' ||
      typeof adGuard.username === 'undefined' ||
      typeof adGuard.password === 'undefined'
    ) {
      return Promise.reject('Some AdGuardSettings are undefined.')
    }
    const url = this.getAdGuardBaseUrl(adGuard.adguard_uri_base, statusEndpoint)

    return axios.get<AdGuardVersion>(url.href, this.getAxiosConfig(adGuard.username, adGuard.password))
  }

  /**
   * Change AdGuard Status
   * @param mode
   * @param time
   */
  public static async changeAdGuardStatus(
    mode: AdGuardApiStatusEnum,
    time: number
  ): Promise<AxiosResponse<string>[]> {

    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    if (time < 0) {
      return Promise.reject(`Disable time smaller than allowed:${time}`)
    }

    const promiseArray = new Array<Promise<AxiosResponse<string>>>()

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
            axios.post(url.href, data, this.getAxiosConfigStr(adguard.username, adguard.password))
            )
    }

    return Promise.all(promiseArray)
  }

  public static async addDomainToList(
    list: ApiList,
    domain: string
  ): Promise<AxiosResponse<AdGuardListStatus>[]> {
    return this.changeDomainOnList(list, ApiListMode.add, domain)
  }

  public static async subDomainFromList(
    list: ApiList,
    domain: string
  ): Promise<AxiosResponse<AdGuardListStatus>[]> {
    return this.changeDomainOnList(list, ApiListMode.sub, domain)
  }

  private static async changeDomainOnList(
    list: ApiList,
    mode: ApiListMode,
    domain: string
  ): Promise<AxiosResponse<AdGuardListStatus>[]> {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()

    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    if (domain.length < 1) {
      return Promise.reject("Domain can't be empty")
    }

    const promiseArray = new Array<Promise<AxiosResponse<AdGuardListStatus>>>()

    for (const adguard of adGuardSettingsArray) {
      if (
        typeof adguard.adguard_uri_base === 'undefined' ||
        typeof adguard.username === 'undefined' ||
        typeof adguard.password === 'undefined'
      ) {
        return Promise.reject('Some AdGuardSettings are undefined.')
      }
      const url = this.getAdGuardBaseUrl(adguard.adguard_uri_base, adguard.password)
      url.searchParams.append('list', list)
      url.searchParams.append(mode, domain)
      promiseArray.push(
        axios.get<AdGuardListStatus>(url.href, this.getAxiosConfig(adguard.username, adguard.password))
      )
    }

    return Promise.all(promiseArray)
  }

  private static getAxiosConfig(u:string, p:string): AxiosRequestConfig {
    return {
      transformResponse: [
        (data) => {
          // console.log(`Server response: ${data}`)
          let resp;
          if(!data || data===""){
            throw Error(`Empty response from server`);
          }
          try {
            resp = JSON.parse(data);
          } catch (error) {
            if(data.trim()==="Forbidden"){
              throw Error(`Forbidden: Please check the credentials.`)
            }
            throw Error(`Unexpected error: ${error}:${data}`
            );
          }
          return resp
        },
      ],
      auth: {
        username: u,
        password: p
      }
    }
  }

  private static getAxiosConfigStr(u:string, p:string): AxiosRequestConfig {
    return {
      transformResponse: [
        (data) => {
          if(!data || data===""){
            throw Error(`Empty response from server`);
          }
          if(data.trim()==="Forbidden"){
            throw Error(`Forbidden: Please check the credentials.`)
          }
          // console.log(`Server response: ${data}`)
          return data?data.trim():data
        }
      ],

      auth: {
        username: u,
        password: p
      }
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
