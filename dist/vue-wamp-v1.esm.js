function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

let MessageCode;

(function (MessageCode) {
  MessageCode[MessageCode["MSG_WELCOME"] = 0] = "MSG_WELCOME";
  MessageCode[MessageCode["MSG_PREFIX"] = 1] = "MSG_PREFIX";
  MessageCode[MessageCode["MSG_CALL"] = 2] = "MSG_CALL";
  MessageCode[MessageCode["MSG_CALL_RESULT"] = 3] = "MSG_CALL_RESULT";
  MessageCode[MessageCode["MSG_CALL_ERROR"] = 4] = "MSG_CALL_ERROR";
  MessageCode[MessageCode["MSG_SUBSCRIBE"] = 5] = "MSG_SUBSCRIBE";
  MessageCode[MessageCode["MSG_UNSUBSCRIBE"] = 6] = "MSG_UNSUBSCRIBE";
  MessageCode[MessageCode["MSG_PUBLISH"] = 7] = "MSG_PUBLISH";
  MessageCode[MessageCode["MSG_EVENT"] = 8] = "MSG_EVENT";
})(MessageCode || (MessageCode = {}));

class RpcCallError extends Error {
  constructor(topic, message, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params); // Maintains proper stack trace for where our error was thrown (only available on V8)

    _defineProperty(this, "topic", void 0);

    _defineProperty(this, "message", void 0);

    _defineProperty(this, "details", void 0);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcCallError);
    } // Custom debugging information


    this.topic = topic;
    this.message = message;
    this.details = null;
  }

}

class WampClient {
  constructor(host, logger) {
    _defineProperty(this, "wsuri", void 0);

    _defineProperty(this, "socket", void 0);

    _defineProperty(this, "sessionId", null);

    _defineProperty(this, "onOpenEvents", void 0);

    _defineProperty(this, "onCloseEvents", void 0);

    _defineProperty(this, "onConnectEvents", void 0);

    _defineProperty(this, "subscriptions", void 0);

    _defineProperty(this, "rpcCalls", void 0);

    _defineProperty(this, "isConnected", void 0);

    _defineProperty(this, "isConnecting", void 0);

    _defineProperty(this, "isLost", void 0);

    _defineProperty(this, "logger", void 0);

    this.wsuri = host;
    this.socket = null;
    this.sessionId = null;
    this.onOpenEvents = [];
    this.onCloseEvents = [];
    this.onConnectEvents = [];
    this.subscriptions = [];
    this.rpcCalls = [];
    this.isLost = false;
    this.isConnected = false;
    this.isConnecting = false;
    this.logger = logger;
  }

  open() {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    try {
      // Open WS connection to server
      this.socket = new WebSocket(this.wsuri);
    } catch (e) {
      throw new Error('Connection could not be established');
    }

    this.isConnecting = true; // Connection established with WS server

    this.socket.addEventListener('open', () => {
      this.onOpenEvents.forEach(eventCallback => {
        eventCallback();
      });
    }); // Connection closed by WS server

    this.socket.addEventListener('close', event => {
      if (this.isConnected) {
        if (event.wasClean) {
          // Connection was closed cleanly (closing HS was performed)
          this.onCloseEvents.forEach(eventCallback => {
            eventCallback(0, `WS-${event.code}: ${event.reason}`);
          });
        } else {
          // Connection was closed uncleanly (lost without closing HS)
          this.onCloseEvents.forEach(eventCallback => {
            eventCallback(1, null);
          });
        }
      } else {
        // Connection could not be established in the first place
        this.onCloseEvents.forEach(eventCallback => {
          eventCallback(3, null);
        });
      }

      this.subscriptions.forEach((subscription, index) => {
        if (subscription.subscribed) {
          this.subscriptions[index].subscribed = false;
        }
      });
      this.isConnected = false;
    });
    this.socket.addEventListener('message', event => {
      let message = [];

      try {
        // Parse received message
        message = JSON.parse(event.data);
      } catch (e) {
        throw new Error(`Received message is not valid JSON`);
      } // On first position is message code


      const code = message.shift();

      switch (code) {
        // Welcome
        // [code: number, wamp session: string, wamp version: number, server info: string]
        case MessageCode.MSG_WELCOME:
          const version = message[1];
          const server = message[2];

          if (version !== 1) {
            throw new Error(`Server "${server}" uses incompatible protocol version ${version}`);
          }

          this.sessionId = message[0];

          if (this.isLost) {
            this.logger.event('opened re-established connection after lost', this.sessionId, version, server);
          } else {
            this.logger.event('opened', this.sessionId, version, server);
          }

          this.isLost = false;
          this.isConnecting = false;
          this.isConnected = true;
          this.onConnectEvents.forEach(eventCallback => {
            eventCallback();
          });
          this.subscriptions.forEach((subscription, index) => {
            if (!subscription.subscribed) {
              this.subscriptions[index].subscribed = this.send([MessageCode.MSG_SUBSCRIBE, subscription.topic]);

              if (!this.subscriptions[index].subscribed) {
                this.logger.warn('subscribe failed', subscription.topic);
              } else {
                this.logger.info('subscribed', subscription.topic);
              }
            }
          });
          break;
        // RPC Call result

        case MessageCode.MSG_CALL_RESULT:
          this.rpcCallResult(message, code);
          break;
        // RPC Call error

        case MessageCode.MSG_CALL_ERROR:
          this.rpcCallResult(message, code);
          break;
        // Event

        case MessageCode.MSG_EVENT:
          this.subscriptions.filter(({
            topic
          }) => topic === message[0]).forEach(subscription => {
            subscription.callbacks.forEach(callback => {
              callback(message[1]);
            });
          });
          break;
      }
    });
  }

  reconnect() {
    this.close();
    this.isLost = true;
    this.open();
  }

  close(reason, message) {
    if (this.socket !== null) {
      this.socket.close(reason, message);
      this.socket = null;
    }

    this.isLost = false;
    this.isConnecting = false;
    this.isConnected = false;
  }

  subscribe(topic, handler) {
    this.logger.event('subscribe', topic);

    if (!this.isSubscribed(topic)) {
      this.subscriptions.push({
        topic,
        subscribed: false,
        callbacks: []
      });
    }

    const index = this.subscriptions.findIndex(subscription => subscription.topic === topic);

    if (index !== -1) {
      this.subscriptions[index].callbacks.push(handler);

      if (this.isConnected) {
        this.subscriptions[index].subscribed = this.send([MessageCode.MSG_SUBSCRIBE, topic]);

        if (!this.subscriptions[index].subscribed) {
          this.logger.warn('subscribe failed', topic);
        } else {
          this.logger.info('subscribed', topic);
        }

        return this.subscriptions[index].subscribed;
      }
    }

    return false;
  }

  unsubscribe(topic, handler) {
    this.logger.event('unsubscribe', topic);

    for (let i = 0, len = this.subscriptions.length; i < len; i++) {
      if (this.subscriptions[i].topic === topic) {
        for (let j = 0, callLen = this.subscriptions[i].callbacks.length; j < callLen; i++) {
          if (this.subscriptions[i].callbacks[j] === handler) {
            this.subscriptions[i].callbacks.splice(i, 1);
            break;
          }
        }

        if (this.subscriptions[i].callbacks.length === 0 && this.isConnected) {
          return this.send([MessageCode.MSG_UNSUBSCRIBE, topic]);
        }
      }
    }

    return true;
  }

  isSubscribed(topic) {
    return this.subscriptions.findIndex(subscription => subscription.topic === topic) !== -1;
  }

  publish(topic, event, exclude, eligible) {
    this.logger.event('publish', topic, event, exclude, eligible);
    return this.send([MessageCode.MSG_PUBLISH, event, exclude, eligible]);
  }

  call(topic, ...data) {
    this.logger.event('call', topic);
    const callId = Math.random().toString(36).substring(2);
    return new Promise((resolve, reject) => {
      const result = this.send([MessageCode.MSG_CALL, callId, topic].concat(data));

      if (result) {
        this.rpcCalls.push({
          id: callId,
          resolve,
          reject
        });
      } else {
        reject(new Error('RPC not processed'));
      }
    });
  }

  onOpenEvent(listener) {
    this.onOpenEvents.push(listener);
  }

  onCloseEvent(listener) {
    this.onCloseEvents.push(listener);
  }

  onConnectEvent(listener) {
    this.onConnectEvents.push(listener);
  }

  offOpenEvent(listener) {
    for (let i = 0, len = this.onOpenEvents.length; i < len; i++) {
      if (this.onOpenEvents[i] === listener) {
        this.onOpenEvents.splice(i, 1);
        break;
      }
    }
  }

  offCloseEvent(listener) {
    for (let i = 0, len = this.onCloseEvents.length; i < len; i++) {
      if (this.onCloseEvents[i] === listener) {
        this.onCloseEvents.splice(i, 1);
        break;
      }
    }
  }

  offConnectEvent(listener) {
    for (let i = 0, len = this.onConnectEvents.length; i < len; i++) {
      if (this.onConnectEvents[i] === listener) {
        this.onConnectEvents.splice(i, 1);
        break;
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


  send(message) {
    if (this.socket === null) {
      this.logger.error('not.connected');
      return false;
    } else if (this.isConnecting) {
      this.logger.error('connecting');
      return false;
    } else if (!this.isConnected) {
      this.logger.error('lost');
      return false;
    } else {
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (e) {
        this.logger.error('send.error');
        return false;
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


  rpcCallResult(message, code) {
    const rpcCall = this.rpcCalls.find(({
      id
    }) => id === message[0]);

    if (typeof rpcCall === 'undefined') {
      return;
    }

    const index = this.rpcCalls.findIndex(({
      id
    }) => id === message[0]);

    if (index !== -1) {
      this.rpcCalls.splice(index, 1);
    } else {
      this.rpcCalls = [];
    }

    if (code === MessageCode.MSG_CALL_ERROR) {
      const error = new RpcCallError(message[1], message[2]);

      if (message.length === 4) {
        error.details = message[3];
      }

      if (Object.prototype.hasOwnProperty.call(rpcCall, 'reject') && typeof rpcCall.reject !== 'undefined') {
        rpcCall.reject(error);
      }
    } else if (code === MessageCode.MSG_CALL_RESULT && Object.prototype.hasOwnProperty.call(rpcCall, 'resolve') && typeof rpcCall.resolve !== 'undefined') {
      rpcCall.resolve({
        data: message[1]
      });
    }
  }

}

class WampLogger {
  constructor(debug) {
    _defineProperty(this, "debug", false);

    _defineProperty(this, "prefix", '%cVue-Wamp: ');

    this.debug = debug;
  }

  info(text, ...args) {
    if (this.debug) {
      window.console.info(`${this.prefix}%c${text}`, 'color: blue; font-weight: 600', 'color: #333333', args);
    }
  }

  error(text, ...args) {
    if (this.debug) {
      window.console.error(`${this.prefix}%c${text}`, 'color: red; font-weight: 600', 'color: #333333', args);
    }
  }

  warn(text, ...args) {
    if (this.debug) {
      window.console.warn(`${this.prefix}%c${text}`, 'color: yellow; font-weight: 600', 'color: #333333', args);
    }
  }

  event(text, ...args) {
    if (this.debug) {
      window.console.info(`${this.prefix}%c${text}`, 'color: blue; font-weight: 600', 'color: #333333', args);
    }
  }

}

var defaultOptions = {
  namespace: 'wamp',
  autoReestablish: true,
  autoCloseTimeout: -1,
  debug: false
};

// Import library
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// install function executed by Vue.use()
const install = function installVueWampV1(Vue, options) {
  if (install.installed) return;
  install.installed = true;
  const {
    namespace
  } = options;
  const injectKey = `$${namespace}`;
  options = { ...defaultOptions,
    ...options
  };
  const wampClient = new WampClient(options.wsuri, new WampLogger(options.debug));

  if (!Object.prototype.hasOwnProperty.call(Vue, injectKey)) {
    Object.defineProperties(Vue, {
      [injectKey]: {
        get() {
          return wampClient;
        }

      }
    });
  }

  if (!Object.prototype.hasOwnProperty.call(Vue.prototype, injectKey)) {
    Object.defineProperties(Vue.prototype, {
      [injectKey]: {
        get() {
          return wampClient;
        }

      }
    });
  } // Auto install


  if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'Vue')) {
    window.Wamp = wampClient;
  }
}; // Create module definition for Vue.use()


const plugin = {
  install
}; // To auto-install on non-es builds, when vue is found

export default plugin;
