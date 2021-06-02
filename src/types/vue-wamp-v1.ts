import Vue, { PluginFunction } from 'vue'

export interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}

export type OnOpenCallback = () => void
export type OnCloseCallback = (code: number, reason: string | null) => void
export type OnConnectCallback = () => void
export type OnDisconnectCallback = () => void

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

  onDisconnectEvent(listener: OnDisconnectCallback): void

  offOpenEvent(listener: OnOpenCallback): void

  offCloseEvent(listener: OnCloseCallback): void

  offConnectEvent(listener: OnConnectCallback): void

  offDisconnectEvent(listener: OnDisconnectCallback): void
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

declare const VueWampV1: { install: InstallFunction }

declare module 'vue/types/vue' {
  interface Vue {
    $wamp: WampClientInterface
  }

  interface VueConstructor {
    $wamp: WampClientInterface
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    wamp?: {
      subscribe?: {},
      register?: {},
    }
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $wamp: WampClientInterface
  }
}

export default VueWampV1
