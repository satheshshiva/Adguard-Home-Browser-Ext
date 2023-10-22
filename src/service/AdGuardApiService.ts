import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AdGuardApiStatus } from '../api/models/AdGuardApiStatus'
import { AdGuardSettingsStorage, StorageService } from './StorageService'
import { AdGuardListStatus } from '../api/models/AdGuardListStatus'
import { AdGuardVersions } from '../api/models/AdGuardVersions'
import ApiListMode from '../api/enum/ApiListMode'
import ApiList from '../api/enum/ApiList'
import AdGuardApiStatusEnum from '../api/enum/AdGuardApiStatusEnum'

const statusEndpoint="control/status"

export default class AdGuardApiService {
  public static async getAdGuardStatusCombined(): Promise<AdGuardApiStatusEnum> {
    return new Promise<AdGuardApiStatusEnum>(resolve => {
      this.getAdGuardStatus()
        .then(results => {
          for (const result of results) {
            const resultData = result.data
            // If any AdGuard instance is offline or has an error we use its status
            if (
              resultData.status === AdGuardApiStatusEnum.error ||
              resultData.status === AdGuardApiStatusEnum.disabled
            ) {
              resolve(resultData.status)
            }
          }
          resolve(AdGuardApiStatusEnum.enabled)
        })
        .catch(reason => {
          console.warn(reason)
          resolve(AdGuardApiStatusEnum.error)
        })
    })
  }

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

  public static async getAdGuardVersions(): Promise<
    AxiosResponse<AdGuardVersions>[]
  > {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }
    const promiseArray = new Array<Promise<AxiosResponse<AdGuardVersions>>>()

    for (const instance of adGuardSettingsArray) {
      promiseArray.push(this.getAdGuardVersion(instance))
    }

    return Promise.all(promiseArray)
  }

  public static async getAdGuardVersion(
    adGuard: AdGuardSettingsStorage
  ): Promise<AxiosResponse<AdGuardVersions>> {
    if (
      typeof adGuard.adguard_uri_base === 'undefined' ||
      typeof adGuard.username === 'undefined' ||
      typeof adGuard.password === 'undefined'
    ) {
      return Promise.reject('Some AdGuardSettings are undefined.')
    }
    const url = this.getAdGuardBaseUrl(adGuard.adguard_uri_base, statusEndpoint)

    return axios.get<AdGuardVersions>(url.href, this.getAxiosConfig(adGuard.username, adGuard.password))
  }

  public static async changeAdGuardStatus(
    mode: AdGuardApiStatusEnum,
    time: number
  ): Promise<AxiosResponse<AdGuardApiStatus>[]> {
    const adGuardSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof adGuardSettingsArray === 'undefined') {
      return Promise.reject('AdGuardSettings empty')
    }

    if (time < 0) {
      return Promise.reject(`Disable time smaller than allowed:${time}`)
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

      const url = this.getAdGuardBaseUrl(adguard.adguard_uri_base, "control/protection")
      let data
      if (mode === AdGuardApiStatusEnum.disabled) {
        data = {enabled: false}
      } else if (mode === AdGuardApiStatusEnum.enabled) {
        data = {enabled: true,
                duration: time}
      } else {
        return Promise.reject(`Mode ${mode} not allowed for this function.`)
      }

      promiseArray.push(
        axios.post<AdGuardApiStatus>(url.href, data, this.getAxiosConfig(adguard.username, adguard.password))
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
      transformResponse: data => JSON.parse(data),
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
