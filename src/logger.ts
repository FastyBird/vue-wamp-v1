import { WampLoggerInterface } from './types'

export class WampLogger implements WampLoggerInterface {
  private debug: boolean = false
  private prefix: string = '%cVue-Wamp: '

  constructor(debug: boolean) {
    this.debug = debug
  }

  public info(text: string, ...args: any[]): void {
    if (this.debug) {
      window.console.info(`${this.prefix}%c${text}`, 'color: blue; font-weight: 600', 'color: #333333', args)
    }
  }

  public error(...args: any[]): void {
    if (this.debug) {
      window.console.error(this.prefix, args);
    }
  }

  public warn(...args: any[]): void {
    if (this.debug) {
      window.console.warn(this.prefix, args);
    }
  }

  public event(text: string, ...args: any[]): void {
    if (this.debug) {
      window.console.info(`${this.prefix}%c${text}`, 'color: blue; font-weight: 600', 'color: #333333', args);
    }
  }
}
