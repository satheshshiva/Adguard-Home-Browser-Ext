import {
  BadgeService,
} from '../../../service/BadgeService'
import ContextMenuInitializer from './ContextMenuInitializer'
import ChromeRuntimeInitializer from './ChromeRuntimeInitializer'
import { Initializer } from '../../general/Initializer'
import HotKeyInitializer from './HotKeyInitializer'
import CheckStatusInitializer from "./CheckStatusInitializer";

export default class BackgroundInitializer implements Initializer {
  public init(): void {
    BadgeService.setBadgeText('')
    new ContextMenuInitializer().init()
    new ChromeRuntimeInitializer().init()
    new HotKeyInitializer().init()
    new CheckStatusInitializer().init()
  }
}
