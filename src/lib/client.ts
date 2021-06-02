import {
  OnCloseCallback,
  OnConnectCallback, OnDisconnectCallback,
  OnOpenCallback, RpCallPromise,
  RpcCallErrorInterface,
  SubscribeCallback,
  WampClientInterface,
  WampLoggerInterface,
  WampRpCallInterface,
  WampSubscriptionInterface,
} from '@/types/vue-wamp-v1'

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

class RpcCallError extends Error implements RpcCallErrorInterface {
  public topic: string
  public message: string

  public details: string | Array<any> | null

  constructor(topic: string, message: string, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcCallError)
    }

    // Custom debugging information
    this.topic = topic
    this.message = message
    this.details = null
  }
}

export default class WampClient implements WampClientInterface {
  private readonly wsuri: string

  private socket: WebSocket | null
  private sessionId: string | null = null

  private onOpenEvents: Array<OnOpenCallback>
  private onCloseEvents: Array<OnCloseCallback>
  private onConnectEvents: Array<OnConnectCallback>
  private onDisconnectEvents: Array<OnDisconnectCallback>

  private subscriptions: Array<WampSubscriptionInterface>
  private rpcCalls: Array<WampRpCallInterface>

  private isConnected: boolean
  private isConnecting: boolean
  private isLost: boolean

  private logger: WampLoggerInterface

  constructor(host: string, logger: WampLoggerInterface) {
    this.wsuri = host

    this.socket = null
    this.sessionId = null

    this.onOpenEvents = []
    this.onCloseEvents = []
    this.onConnectEvents = []
    this.onDisconnectEvents = []

    this.subscriptions = []
    this.rpcCalls = []

    this.isLost = false
    this.isConnected = false
    this.isConnecting = false

    this.logger = logger
  }

  public open(): void {
    if (this.isConnected || this.isConnecting) {
      return
    }

    try {
      // Open WS connection to server
      this.socket = new WebSocket(this.wsuri)
    } catch (e) {
      throw new Error('Connection could not be established')
    }

    this.isConnecting = true

    // Connection established with WS server
    this.socket.addEventListener('open', () => {
      this.onOpenEvents
        .forEach((eventCallback): void => {
          eventCallback()
        })
    })

    // Connection closed by WS server
    this.socket.addEventListener('close', (event) => {
      if (this.isConnected) {
        this.onDisconnectEvents
          .forEach((eventCallback): void => {
            eventCallback()
          })

        if (event.wasClean) {
          // Connection was closed cleanly (closing HS was performed)
          this.onCloseEvents
            .forEach((eventCallback): void => {
              eventCallback(0, `WS-${event.code}: ${event.reason}`)
            })
        } else {
          // Connection was closed uncleanly (lost without closing HS)
          this.onCloseEvents
            .forEach((eventCallback): void => {
              eventCallback(1, null)
            })
        }
      } else {
        // Connection could not be established in the first place
        this.onCloseEvents
          .forEach((eventCallback): void => {
            eventCallback(3, null)
          })
      }

      this.subscriptions.forEach((subscription, index) => {
        if (subscription.subscribed) {
          this.subscriptions[index].subscribed = false
        }
      })

      this.isConnected = false
    })

    this.socket.addEventListener('message', (event): void => {
      let message: Array<any> = []

      try {
        // Parse received message
        message = JSON.parse(event.data)
      } catch (e) {
        throw new Error(`Received message is not valid JSON`)
      }

      // On first position is message code
      const code: MessageCode = message.shift()

      switch (code) {
        // Welcome
        // [code: number, wamp session: string, wamp version: number, server info: string]
        case MessageCode.MSG_WELCOME:
          const version: number = message[1]
          const server: string = message[2]

          if (version !== 1) {
            throw new Error(`Server "${server}" uses incompatible protocol version ${version}`)
          }

          this.sessionId = message[0]

          if (this.isLost) {
            this.logger.event('opened re-established connection after lost', this.sessionId, version, server)
          } else {
            this.logger.event('opened', this.sessionId, version, server)
          }

          this.isLost = false
          this.isConnecting = false
          this.isConnected = true

          this.onConnectEvents
            .forEach((eventCallback): void => {
              eventCallback()
            })

          this.subscriptions
            .forEach((subscription, index) => {
              if (!subscription.subscribed) {
                this.subscriptions[index].subscribed = this.send([MessageCode.MSG_SUBSCRIBE, subscription.topic])

                if (!this.subscriptions[index].subscribed) {
                  this.logger.warn('subscribe failed', subscription.topic)
                } else {
                  this.logger.info('subscribed', subscription.topic)
                }
              }
            })
          break

        // RPC Call result
        case MessageCode.MSG_CALL_RESULT:
          this.rpcCallResult(message, code)
          break

        // RPC Call error
        case MessageCode.MSG_CALL_ERROR:
          this.rpcCallResult(message, code)
          break

        // Event
        case MessageCode.MSG_EVENT:
          this.subscriptions
            .filter(({topic}) => topic === message[0])
            .forEach((subscription): void => {
              subscription.callbacks.forEach(callback => {
                callback(message[1])
              })
            })
          break
      }
    })
  }

  public reconnect(): void {
    this.close()
    this.isLost = true
    this.open()
  }

  public close(reason?: number, message?: string): void {
    if (this.socket !== null) {
      this.socket.close(reason, message)

      this.socket = null
    }

    this.isLost = false
    this.isConnecting = false
    this.isConnected = false
  }

  public subscribe(topic: string, handler: SubscribeCallback): boolean {
    this.logger.event('subscribe', topic)

    if (!this.isSubscribed(topic)) {
      this.subscriptions.push({
        topic,
        subscribed: false,
        callbacks: [],
      })
    }

    const index = this.subscriptions.findIndex((subscription): boolean => subscription.topic === topic)

    if (index !== -1) {
      this.subscriptions[index].callbacks.push(handler)

      if (this.isConnected) {
        this.subscriptions[index].subscribed = this.send([MessageCode.MSG_SUBSCRIBE, topic])

        if (!this.subscriptions[index].subscribed) {
          this.logger.warn('subscribe failed', topic)
        } else {
          this.logger.info('subscribed', topic)
        }

        return this.subscriptions[index].subscribed
      }
    }

    return false
  }

  public unsubscribe(topic: string, handler: SubscribeCallback): boolean {
    this.logger.event('unsubscribe', topic)

    for (let i = 0, len = this.subscriptions.length; i < len; i++) {
      if (this.subscriptions[i].topic === topic) {
        for (let j = 0, callLen = this.subscriptions[i].callbacks.length; j < callLen; i++) {
          if (this.subscriptions[i].callbacks[j] === handler) {
            this.subscriptions[i].callbacks.splice(i, 1)

            break
          }
        }

        if (this.subscriptions[i].callbacks.length === 0 && this.isConnected) {
          return this.send([MessageCode.MSG_UNSUBSCRIBE, topic])
        }
      }
    }

    return true
  }

  public isSubscribed(topic: string): boolean {
    return this.subscriptions.findIndex((subscription): boolean => subscription.topic === topic) !== -1
  }

  public publish(topic: string, event: string, exclude?: Array<string> | null, eligible?: Array<string> | null): boolean {
    this.logger.event('publish', topic, event, exclude, eligible)

    return this.send([MessageCode.MSG_PUBLISH, event, exclude, eligible])
  }

  public call(topic: string, ...data: any): RpCallPromise {
    this.logger.event('call', topic)

    const callId = Math.random().toString(36).substring(2)

    return new Promise((resolve, reject) => {
      const result = this.send([MessageCode.MSG_CALL, callId, topic].concat(data))

      if (result) {
        this.rpcCalls.push({
          id: callId,
          resolve,
          reject,
        })
      } else {
        reject(new Error('RPC not processed'))
      }
    })
  }

  public onOpenEvent(listener: OnOpenCallback): void {
    this.onOpenEvents.push(listener)
  }

  public onCloseEvent(listener: OnCloseCallback): void {
    this.onCloseEvents.push(listener)
  }

  public onConnectEvent(listener: OnConnectCallback): void {
    this.onConnectEvents.push(listener)
  }

  public onDisconnectEvent(listener: OnDisconnectCallback): void {
    this.onDisconnectEvents.push(listener)
  }

  public offOpenEvent(listener: OnOpenCallback): void {
    for (let i = 0, len = this.onOpenEvents.length; i < len; i++) {
      if (this.onOpenEvents[i] === listener) {
        this.onOpenEvents.splice(i, 1)

        break
      }
    }
  }

  public offCloseEvent(listener: OnCloseCallback): void {
    for (let i = 0, len = this.onCloseEvents.length; i < len; i++) {
      if (this.onCloseEvents[i] === listener) {
        this.onCloseEvents.splice(i, 1)

        break
      }
    }
  }

  public offConnectEvent(listener: OnConnectCallback): void {
    for (let i = 0, len = this.onConnectEvents.length; i < len; i++) {
      if (this.onConnectEvents[i] === listener) {
        this.onConnectEvents.splice(i, 1)

        break
      }
    }
  }

  public offDisconnectEvent(listener: OnDisconnectCallback): void {
    for (let i = 0, len = this.onDisconnectEvents.length; i < len; i++) {
      if (this.onDisconnectEvents[i] === listener) {
        this.onDisconnectEvents.splice(i, 1)

        break
      }
    }
  }

  /**
   * Send data via websockets
   *
   * @param {Array<any>} message
   *
   * @return boolean
   *
   * @private
   */
  private send(message: Array<any>): boolean {
    if (this.socket === null) {
      this.logger.error('not.connected')

      return false
    } else if (this.isConnecting) {
      this.logger.error('connecting')

      return false
    } else if (!this.isConnected) {
      this.logger.error('lost')

      return false
    } else {
      try {
        this.socket.send(JSON.stringify(message))

        return true
      } catch (e) {
        this.logger.error('send.error')

        return false
      }
    }
  }

  /**
   * Handle RPC result
   *
   * @param {Array<any>} message
   * @param {number} code
   *
   * @private
   */
  private rpcCallResult(message: Array<any>, code: number): void {
    const rpcCall = this.rpcCalls.find(({id}): boolean => id === message[0])

    if (typeof rpcCall === 'undefined') {
      return
    }

    const index = this.rpcCalls.findIndex(({id}): boolean => id === message[0])

    if (index !== -1) {
      this.rpcCalls.splice(index, 1)
    } else {
      this.rpcCalls = []
    }

    if (code === MessageCode.MSG_CALL_ERROR) {
      const error = new RpcCallError(message[1], message[2])

      if (message.length === 4) {
        error.details = message[3]
      }

      if (
        Object.prototype.hasOwnProperty.call(rpcCall, 'reject') &&
        typeof rpcCall.reject !== 'undefined'
      ) {
        rpcCall.reject(error)
      }
    } else if (
      code === MessageCode.MSG_CALL_RESULT &&
      Object.prototype.hasOwnProperty.call(rpcCall, 'resolve') &&
      typeof rpcCall.resolve !== 'undefined'
    ) {
      rpcCall.resolve({
        data: message[1],
      })
    }
  }
}
