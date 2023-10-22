import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { PiHoleApiStatus } from '../api/models/PiHoleApiStatus'
import { AdGuardSettingsStorage, StorageService } from './StorageService'
import { PiHoleListStatus } from '../api/models/PiHoleListStatus'
import { PiHoleVersions } from '../api/models/PiHoleVersions'
import ApiListMode from '../api/enum/ApiListMode'
import ApiList from '../api/enum/ApiList'
import PiHoleApiStatusEnum from '../api/enum/PiHoleApiStatusEnum'

const statusEndpoint="control/status"

export default class PiHoleApiService {
  public static async getPiHoleStatusCombined(): Promise<PiHoleApiStatusEnum> {
    return new Promise<PiHoleApiStatusEnum>(resolve => {
      console.log("getPiHoleStatusCombined()")
      this.getPiHoleStatus()
        .then(results => {
          for (const result of results) {
            const resultData = result.data
            // If any PiHole is offline or has an error we use its status
            if (
              resultData.status === PiHoleApiStatusEnum.error ||
              resultData.status === PiHoleApiStatusEnum.disabled
            ) {
              resolve(resultData.status)
            }
          }
          resolve(PiHoleApiStatusEnum.enabled)
        })
        .catch(reason => {
          console.warn(reason)
          resolve(PiHoleApiStatusEnum.error)
        })
    })
  }

  public static async getPiHoleStatus(): Promise<
    AxiosResponse<PiHoleApiStatus>[]
  > {
    console.log("getPiHoleStatus()")
    const piHoleSettingsArray = await StorageService.getPiHoleSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    const promiseArray = new Array<Promise<AxiosResponse<PiHoleApiStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' || 
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }

      const url = this.getPiHoleBaseUrl(piHole.adguard_uri_base, statusEndpoint)

      promiseArray.push(
        axios.get<PiHoleApiStatus>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
      )
    }

    return Promise.all(promiseArray)
  }

  public static async getPiHoleVersions(): Promise<
    AxiosResponse<PiHoleVersions>[]
  > {
    console.log("getPiHoleVersions()")
    const piHoleSettingsArray = await StorageService.getPiHoleSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }
    const promiseArray = new Array<Promise<AxiosResponse<PiHoleVersions>>>()

    for (const instance of piHoleSettingsArray) {
      promiseArray.push(this.getPiHoleVersion(instance))
    }

    return Promise.all(promiseArray)
  }

  public static async getPiHoleVersion(
    piHole: AdGuardSettingsStorage
  ): Promise<AxiosResponse<PiHoleVersions>> {
    console.log("getPiHoleVersion()")
    if (
      typeof piHole.adguard_uri_base === 'undefined' ||
      typeof piHole.username === 'undefined' ||
      typeof piHole.password === 'undefined'
    ) {
      return Promise.reject('Some PiHoleSettings are undefined.')
    }
    const url = this.getPiHoleBaseUrl(piHole.adguard_uri_base, statusEndpoint)

    return axios.get<PiHoleVersions>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
  }

  public static async changePiHoleStatus(
    mode: PiHoleApiStatusEnum,
    time: number
  ): Promise<AxiosResponse<PiHoleApiStatus>[]> {
    const piHoleSettingsArray = await StorageService.getPiHoleSettingsArray()
    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    if (time < 0) {
      return Promise.reject(`Disable time smaller than allowed:${time}`)
    }

    const promiseArray = new Array<Promise<AxiosResponse<PiHoleApiStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' ||
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }

      const url = this.getPiHoleBaseUrl(piHole.adguard_uri_base, "control/protection")
      let data
      if (mode === PiHoleApiStatusEnum.disabled) {
        data = {enabled: false}
      } else if (mode === PiHoleApiStatusEnum.enabled) {
        data = {enabled: true,
                duration: time}
      } else {
        return Promise.reject(`Mode ${mode} not allowed for this function.`)
      }

      promiseArray.push(
        axios.post<PiHoleApiStatus>(url.href, data, this.getAxiosConfig(piHole.username, piHole.password))
      )
    }

    return Promise.all(promiseArray)
  }

  public static async addDomainToList(
    list: ApiList,
    domain: string
  ): Promise<AxiosResponse<PiHoleListStatus>[]> {
    return this.changeDomainOnList(list, ApiListMode.add, domain)
  }

  public static async subDomainFromList(
    list: ApiList,
    domain: string
  ): Promise<AxiosResponse<PiHoleListStatus>[]> {
    return this.changeDomainOnList(list, ApiListMode.sub, domain)
  }

  private static async changeDomainOnList(
    list: ApiList,
    mode: ApiListMode,
    domain: string
  ): Promise<AxiosResponse<PiHoleListStatus>[]> {
    const piHoleSettingsArray = await StorageService.getPiHoleSettingsArray()

    if (typeof piHoleSettingsArray === 'undefined') {
      return Promise.reject('PiHoleSettings empty')
    }

    if (domain.length < 1) {
      return Promise.reject("Domain can't be empty")
    }

    const promiseArray = new Array<Promise<AxiosResponse<PiHoleListStatus>>>()

    for (const piHole of piHoleSettingsArray) {
      if (
        typeof piHole.adguard_uri_base === 'undefined' ||
        typeof piHole.username === 'undefined' ||
        typeof piHole.password === 'undefined'
      ) {
        return Promise.reject('Some PiHoleSettings are undefined.')
      }
      const url = this.getPiHoleBaseUrl(piHole.adguard_uri_base, piHole.password)
      url.searchParams.append('list', list)
      url.searchParams.append(mode, domain)
      promiseArray.push(
        axios.get<PiHoleListStatus>(url.href, this.getAxiosConfig(piHole.username, piHole.password))
      )
    }

    return Promise.all(promiseArray)
  }

  private static getAxiosConfig(u:string, p:string): AxiosRequestConfig {
    console.log("getAxiosConfig " )
    console.log(u )
    console.log("password " )
    console.log(p )
    return {
      transformResponse: data => JSON.parse(data),
      auth: {
        username: u,
        password: p
      }
    }
  }

  private static getPiHoleBaseUrl(domain: string, endpoint?: string): URL {
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
