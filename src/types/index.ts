export type OnOpenCallback = () => void
export type OnCloseCallback = (code: number, reason: string | null) => void
export type OnConnectCallback = () => void
export type SubscribeCallback = (content: string) => void

export type RpCallSuccessCallback = (response: string) => void
export type RpCallErrorCallback = (error: RpcCallErrorInterface) => void

export interface RpcCallErrorInterface extends Error {
  uri: string
  details: string | null
  exception: Error | null
}

export interface WampSubscriptionInterface {
  topic: string
  callback: SubscribeCallback
}

export interface WampRpCallInterface {
  id: string
  success?: RpCallSuccessCallback
  error?: RpCallErrorCallback
}

export interface WampClientInterface {
  open(): void

  reconnect(): void

  close(reason?: number, message?: string): void

  subscribe(topic: string, handler: SubscribeCallback): boolean

  unsubscribe(topic: string): boolean

  isSubscribed(topic: string): boolean

  publish(topic: string, event: string, exclude: Array<string> | null, eligible: Array<string> | null): boolean

  call(topic: string, ...data: any): boolean

  onOpenEvent(listener: OnOpenCallback): void

  onCloseEvent(listener: OnCloseCallback): void

  onConnectEvent(listener: OnConnectCallback): void

  offOpenEvent(listener: OnOpenCallback): void

  offCloseEvent(listener: OnCloseCallback): void

  offConnectEvent(listener: OnConnectCallback): void
}

export interface WampLoggerInterface {
  info(text: string, ...args: any[]): void

  error(...args: any[]): void

  warn(...args: any[]): void

  event(text: string, ...args: any[]): void
}

export interface VueWampDefaults {
  wsuri: string
  debug: boolean
}
