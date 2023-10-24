import AdGuardApiStatusEnum from '../enum/AdGuardApiStatusEnum'

export interface AdGuardApiStatus {
  protection_disabled_duration: number
  protection_enabled: boolean
  running: boolean
}
