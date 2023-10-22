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
            // If any PiHole is offline or has an error we use its status
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
    const piHoleSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    const promiseArray = new Array<Promise<AxiosResponse<AdGuardApiStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' || 
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }

      const url = this.getAdGuardBaseUrl(piHole.adguard_uri_base, statusEndpoint)

      promiseArray.push(
        axios.get<AdGuardApiStatus>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
      )
    }

    return Promise.all(promiseArray)
  }

  public static async getAdGuardVersions(): Promise<
    AxiosResponse<AdGuardVersions>[]
  > {
    const piHoleSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }
    const promiseArray = new Array<Promise<AxiosResponse<AdGuardVersions>>>()

    for (const instance of piHoleSettingsArray) {
      promiseArray.push(this.getAdGuardVersion(instance))
    }

    return Promise.all(promiseArray)
  }

  public static async getAdGuardVersion(
    piHole: AdGuardSettingsStorage
  ): Promise<AxiosResponse<AdGuardVersions>> {
    if (
      typeof piHole.adguard_uri_base === 'undefined' ||
      typeof piHole.username === 'undefined' ||
      typeof piHole.password === 'undefined'
    ) {
      return Promise.reject('Some PiHoleSettings are undefined.')
    }
    const url = this.getAdGuardBaseUrl(piHole.adguard_uri_base, statusEndpoint)

    return axios.get<AdGuardVersions>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
  }

  public static async changeAdGuardStatus(
    mode: AdGuardApiStatusEnum,
    time: number
  ): Promise<AxiosResponse<AdGuardApiStatus>[]> {
    const piHoleSettingsArray = await StorageService.getAdGuardSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    if (time < 0) {
      return Promise.reject(`Disable time smaller than allowed:${time}`)
    }

    const promiseArray = new Array<Promise<AxiosResponse<AdGuardApiStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' ||
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }

      const url = this.getAdGuardBaseUrl(piHole.adguard_uri_base, "control/protection")
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
        axios.post<AdGuardApiStatus>(url.href, data, this.getAxiosConfig(piHole.username, piHole.password))
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
    const piHoleSettingsArray = await StorageService.getAdGuardSettingsArray()

    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    if (domain.length < 1) {
      return Promise.reject("Domain can't be empty")
    }

    const promiseArray = new Array<Promise<AxiosResponse<AdGuardListStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' ||
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }
      const url = this.getAdGuardBaseUrl(piHole.adguard_uri_base, piHole.password)
      url.searchParams.append('list', list)
      url.searchParams.append(mode, domain)
      promiseArray.push(
        axios.get<AdGuardListStatus>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
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
