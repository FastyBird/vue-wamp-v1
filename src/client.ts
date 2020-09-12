import {
  OnCloseCallback,
  OnConnectCallback,
  OnOpenCallback,
  RpCallErrorCallback,
  RpCallSuccessCallback,
  RpcCallErrorInterface,
  SubscribeCallback,
  WampClientInterface,
  WampLoggerInterface,
  WampRpCallInterface,
  WampSubscriptionInterface,
} from './types'

class RpcCallError extends Error implements RpcCallErrorInterface {
  public uri: string

  public details: string | null

  public exception: Error | null

  constructor(uri: string, exception: Error | null, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcCallError)
    }

    // Custom debugging information
    this.uri = uri
    this.exception = exception
    this.details = null
  }
}

export class WampClient implements WampClientInterface {
  private readonly wsuri: string

  private socket: WebSocket | null
  private sessionId: string | null = null

  private onOpenEvents: Array<OnOpenCallback>
  private onCloseEvents: Array<OnCloseCallback>
  private onConnectEvents: Array<OnConnectCallback>

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

    this.subscriptions = []
    this.rpcCalls = []

    this.isConnected = false
    this.isConnecting = false
    this.isLost = false

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

    this.socket.addEventListener('message', (event) => {
      // Parse received message
      const message = JSON.parse(event.data)
      // On first position is message type definition
      const code = message.shift()

      switch (code) {
        // Welcome
        case 0:
          const version = message[1]
          const server = message[2]

          if (version !== 1) {
            throw new Error(`Server "${server}" uses incompatible protocol version ${version}`)
          }

          this.sessionId = message[0]

          if (this.isLost) {
            this.logger.event('$wamp::opened re-established connection after lost', this.sessionId, version, server)
          } else {
            this.logger.event('$wamp::opened', this.sessionId, version, server)
          }

          this.isLost = false

          this.isConnecting = false
          this.isConnected = true

          this.onConnectEvents
            .forEach((eventCallback): void => {
              eventCallback()
            })

          this.subscriptions.forEach((subscription, index) => {
            if (!subscription.subscribed) {
              this.subscriptions[index].subscribed = this.send([5, subscription.topic])

              if (!this.subscriptions[index].subscribed) {
                this.logger.warn('$wamp::subscribe failed', subscription.topic)
              } else {
                this.logger.info('$wamp::subscribed', subscription.topic)
              }
            }
          })
          break

        // RPC Call result
        case 3:
          this.rpcCallResult(message, code)
          break

        // RPC Call error
        case 4:
          this.rpcCallResult(message, code)
          break

        // Event
        case 8:
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
        // Subscribe event code is 5
        this.subscriptions[index].subscribed = this.send([5, topic])

        if (!this.subscriptions[index].subscribed) {
          this.logger.warn('$wamp::subscribe failed', topic)
        } else {
          this.logger.info('$wamp::subscribed', topic)
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
          // Unsubscribe event code is 6
          return this.send([6, topic])
        }
      }
    }

    return true
  }

  public isSubscribed(topic: string): boolean {
    return this.subscriptions.findIndex((subscription): boolean => subscription.topic === topic) !== -1
  }

  public publish(topic: string, event: string, exclude: Array<string> | null, eligible: Array<string> | null): boolean {
    if (!this.isConnected) {
      return false
    }

    this.logger.event('publish', topic, event, exclude, eligible)

    const slice = [].slice

    // Publish event code is 7
    return this.send([7].concat(slice.call(arguments)))
  }

  public call(topic: string, success?: RpCallSuccessCallback, error?: RpCallErrorCallback): boolean {
    this.logger.event('call', topic)

    const slice = [].slice

    const args = slice.call(arguments, 1)

    const callId = Math.random().toString(36).substring(2)

    const result = this.send([2, callId, topic].concat(args))

    if (result) {
      this.rpcCalls.push({
        id: callId,
        success,
        error,
      })
    }

    return result
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

  private rpcCallResult(message: Array<any>, code: number): void {
    const rpcCall = this.rpcCalls.find(({id}): boolean => id === message[0])

    if (typeof rpcCall === 'undefined') {
      return
    }

    const index = this.rpcCalls.findIndex(({id}): boolean => id === message[0])

    if (index !== -1) {
      this.rpcCalls.splice(index, 1)
    }

    if (code === 4) {
      const error = new RpcCallError(message[1], message[2])

      if (message.length === 4) {
        error.details = message[3]
      }

      if (
        Object.prototype.hasOwnProperty.call(rpcCall, 'error') &&
        typeof rpcCall.error !== 'undefined'
      ) {
        rpcCall.error(error)
      }
    } else if (
      Object.prototype.hasOwnProperty.call(rpcCall, 'success') &&
      typeof rpcCall.success !== 'undefined'
    ) {
      rpcCall.success(message[1])
    }
  }

  private send(message: Array<any>): boolean {
    if (this.socket === null) {
      throw new Error('not.connected')
    } else if (this.isConnecting) {
      throw new Error('connecting')
    } else if (!this.isConnected) {
      throw new Error('lost')
    }

    try {
      this.socket.send(JSON.stringify(message))

      return true
    } catch (e) {
      throw new Error('send.error')
    }
  }
}
