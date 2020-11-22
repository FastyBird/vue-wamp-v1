export type OnOpenCallback = () => void
export type OnCloseCallback = (code: number, reason: string | null) => void
export type OnConnectCallback = () => void

export type SubscribeCallback = (content: string) => void

export interface RpCallResponse<T = any> {
  data: T
}

export interface RpCallPromise<T = any> extends Promise<RpCallResponse<T>> {
}

export interface RpcCallErrorInterface extends Error {
  topic: string
  message: string
  details: string | Array<any> | null
}

export interface WampSubscriptionInterface {
  topic: string
  subscribed: boolean
  callbacks: Array<SubscribeCallback>
}

export interface WampRpCallInterface {
  id: string
  resolve: any
  reject: any
}

export interface WampClientInterface {
  open(): void

  reconnect(): void

  close(reason?: number, message?: string): void

  subscribe(topic: string, handler: SubscribeCallback): boolean

  unsubscribe(topic: string, handler: SubscribeCallback): boolean

  isSubscribed(topic: string): boolean

  publish(topic: string, event: string, exclude?: Array<string> | null, eligible?: Array<string> | null): boolean

  call(topic: string, ...data: any): RpCallPromise

  onOpenEvent(listener: OnOpenCallback): void

  onCloseEvent(listener: OnCloseCallback): void

  onConnectEvent(listener: OnConnectCallback): void

  offOpenEvent(listener: OnOpenCallback): void

  offCloseEvent(listener: OnCloseCallback): void

  offConnectEvent(listener: OnConnectCallback): void
}

export interface WampLoggerInterface {
  info(text: string, ...args: any[]): void

  error(text: string, ...args: any[]): void

  warn(text: string, ...args: any[]): void

  event(text: string, ...args: any[]): void
}

export interface WampClientOptionsInterface {
  wsuri: string
  debug: boolean
  namespace: string,
  autoReestablish: boolean,
  autoCloseTimeout: number,
}

export enum MessageCode {
  MSG_WELCOME = 0,
  MSG_PREFIX = 1,
  MSG_CALL = 2,
  MSG_CALL_RESULT = 3,
  MSG_CALL_ERROR = 4,
  MSG_SUBSCRIBE = 5,
  MSG_UNSUBSCRIBE = 6,
  MSG_PUBLISH = 7,
  MSG_EVENT = 8,
}
