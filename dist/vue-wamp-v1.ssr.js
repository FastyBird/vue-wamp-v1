'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}var MessageCode;

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
})(MessageCode || (MessageCode = {}));var RpcCallError = /*#__PURE__*/function (_Error) {
  _inherits(RpcCallError, _Error);

  var _super = _createSuper(RpcCallError);

  function RpcCallError(topic, message) {
    var _this;

    _classCallCheck(this, RpcCallError);

    for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      params[_key - 2] = arguments[_key];
    }

    // Pass remaining arguments (including vendor specific ones) to parent constructor
    _this = _super.call.apply(_super, [this].concat(params)); // Maintains proper stack trace for where our error was thrown (only available on V8)

    _defineProperty(_assertThisInitialized(_this), "topic", void 0);

    _defineProperty(_assertThisInitialized(_this), "message", void 0);

    _defineProperty(_assertThisInitialized(_this), "details", void 0);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_this), RpcCallError);
    } // Custom debugging information


    _this.topic = topic;
    _this.message = message;
    _this.details = null;
    return _this;
  }

  return RpcCallError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var WampClient = /*#__PURE__*/function () {
  function WampClient(host, logger) {
    _classCallCheck(this, WampClient);

    _defineProperty(this, "wsuri", void 0);

    _defineProperty(this, "socket", void 0);

    _defineProperty(this, "sessionId", null);

    _defineProperty(this, "onOpenEvents", void 0);

    _defineProperty(this, "onCloseEvents", void 0);

    _defineProperty(this, "onConnectEvents", void 0);

    _defineProperty(this, "onDisconnectEvents", void 0);

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
    this.onDisconnectEvents = [];
    this.subscriptions = [];
    this.rpcCalls = [];
    this.isLost = false;
    this.isConnected = false;
    this.isConnecting = false;
    this.logger = logger;
  }

  _createClass(WampClient, [{
    key: "open",
    value: function open() {
      var _this2 = this;

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

      this.socket.addEventListener('open', function () {
        _this2.onOpenEvents.forEach(function (eventCallback) {
          eventCallback();
        });
      }); // Connection closed by WS server

      this.socket.addEventListener('close', function (event) {
        if (_this2.isConnected) {
          _this2.onDisconnectEvents.forEach(function (eventCallback) {
            eventCallback();
          });

          if (event.wasClean) {
            // Connection was closed cleanly (closing HS was performed)
            _this2.onCloseEvents.forEach(function (eventCallback) {
              eventCallback(0, "WS-".concat(event.code, ": ").concat(event.reason));
            });
          } else {
            // Connection was closed uncleanly (lost without closing HS)
            _this2.onCloseEvents.forEach(function (eventCallback) {
              eventCallback(1, null);
            });
          }
        } else {
          // Connection could not be established in the first place
          _this2.onCloseEvents.forEach(function (eventCallback) {
            eventCallback(3, null);
          });
        }

        _this2.subscriptions.forEach(function (subscription, index) {
          if (subscription.subscribed) {
            _this2.subscriptions[index].subscribed = false;
          }
        });

        _this2.isConnected = false;
      });
      this.socket.addEventListener('message', function (event) {
        var message = [];

        try {
          // Parse received message
          message = JSON.parse(event.data);
        } catch (e) {
          throw new Error("Received message is not valid JSON");
        } // On first position is message code


        var code = message.shift();

        switch (code) {
          // Welcome
          // [code: number, wamp session: string, wamp version: number, server info: string]
          case MessageCode.MSG_WELCOME:
            var version = message[1];
            var server = message[2];

            if (version !== 1) {
              throw new Error("Server \"".concat(server, "\" uses incompatible protocol version ").concat(version));
            }

            _this2.sessionId = message[0];

            if (_this2.isLost) {
              _this2.logger.event('opened re-established connection after lost', _this2.sessionId, version, server);
            } else {
              _this2.logger.event('opened', _this2.sessionId, version, server);
            }

            _this2.isLost = false;
            _this2.isConnecting = false;
            _this2.isConnected = true;

            _this2.onConnectEvents.forEach(function (eventCallback) {
              eventCallback();
            });

            _this2.subscriptions.forEach(function (subscription, index) {
              if (!subscription.subscribed) {
                _this2.subscriptions[index].subscribed = _this2.send([MessageCode.MSG_SUBSCRIBE, subscription.topic]);

                if (!_this2.subscriptions[index].subscribed) {
                  _this2.logger.warn('subscribe failed', subscription.topic);
                } else {
                  _this2.logger.info('subscribed', subscription.topic);
                }
              }
            });

            break;
          // RPC Call result

          case MessageCode.MSG_CALL_RESULT:
            _this2.rpcCallResult(message, code);

            break;
          // RPC Call error

          case MessageCode.MSG_CALL_ERROR:
            _this2.rpcCallResult(message, code);

            break;
          // Event

          case MessageCode.MSG_EVENT:
            _this2.subscriptions.filter(function (_ref) {
              var topic = _ref.topic;
              return topic === message[0];
            }).forEach(function (subscription) {
              subscription.callbacks.forEach(function (callback) {
                callback(message[1]);
              });
            });

            break;
        }
      });
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      this.close();
      this.isLost = true;
      this.open();
    }
  }, {
    key: "close",
    value: function close(reason, message) {
      if (this.socket !== null) {
        this.socket.close(reason, message);
        this.socket = null;
      }

      this.isLost = false;
      this.isConnecting = false;
      this.isConnected = false;
    }
  }, {
    key: "subscribe",
    value: function subscribe(topic, handler) {
      this.logger.event('subscribe', topic);

      if (!this.isSubscribed(topic)) {
        this.subscriptions.push({
          topic: topic,
          subscribed: false,
          callbacks: []
        });
      }

      var index = this.subscriptions.findIndex(function (subscription) {
        return subscription.topic === topic;
      });

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
  }, {
    key: "unsubscribe",
    value: function unsubscribe(topic, handler) {
      this.logger.event('unsubscribe', topic);

      for (var i = 0, len = this.subscriptions.length; i < len; i++) {
        if (this.subscriptions[i].topic === topic) {
          for (var j = 0, callLen = this.subscriptions[i].callbacks.length; j < callLen; i++) {
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
  }, {
    key: "isSubscribed",
    value: function isSubscribed(topic) {
      return this.subscriptions.findIndex(function (subscription) {
        return subscription.topic === topic;
      }) !== -1;
    }
  }, {
    key: "publish",
    value: function publish(topic, event, exclude, eligible) {
      this.logger.event('publish', topic, event, exclude, eligible);
      return this.send([MessageCode.MSG_PUBLISH, event, exclude, eligible]);
    }
  }, {
    key: "call",
    value: function call(topic) {
      var _this3 = this;

      for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
      }

      this.logger.event('call', topic);
      var callId = Math.random().toString(36).substring(2);
      return new Promise(function (resolve, reject) {
        var result = _this3.send([MessageCode.MSG_CALL, callId, topic].concat(data));

        if (result) {
          _this3.rpcCalls.push({
            id: callId,
            resolve: resolve,
            reject: reject
          });
        } else {
          reject(new Error('RPC not processed'));
        }
      });
    }
  }, {
    key: "onOpenEvent",
    value: function onOpenEvent(listener) {
      this.onOpenEvents.push(listener);
    }
  }, {
    key: "onCloseEvent",
    value: function onCloseEvent(listener) {
      this.onCloseEvents.push(listener);
    }
  }, {
    key: "onConnectEvent",
    value: function onConnectEvent(listener) {
      this.onConnectEvents.push(listener);
    }
  }, {
    key: "onDisconnectEvent",
    value: function onDisconnectEvent(listener) {
      this.onDisconnectEvents.push(listener);
    }
  }, {
    key: "offOpenEvent",
    value: function offOpenEvent(listener) {
      for (var i = 0, len = this.onOpenEvents.length; i < len; i++) {
        if (this.onOpenEvents[i] === listener) {
          this.onOpenEvents.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: "offCloseEvent",
    value: function offCloseEvent(listener) {
      for (var i = 0, len = this.onCloseEvents.length; i < len; i++) {
        if (this.onCloseEvents[i] === listener) {
          this.onCloseEvents.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: "offConnectEvent",
    value: function offConnectEvent(listener) {
      for (var i = 0, len = this.onConnectEvents.length; i < len; i++) {
        if (this.onConnectEvents[i] === listener) {
          this.onConnectEvents.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: "offDisconnectEvent",
    value: function offDisconnectEvent(listener) {
      for (var i = 0, len = this.onDisconnectEvents.length; i < len; i++) {
        if (this.onDisconnectEvents[i] === listener) {
          this.onDisconnectEvents.splice(i, 1);
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

  }, {
    key: "send",
    value: function send(message) {
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

  }, {
    key: "rpcCallResult",
    value: function rpcCallResult(message, code) {
      var rpcCall = this.rpcCalls.find(function (_ref2) {
        var id = _ref2.id;
        return id === message[0];
      });

      if (typeof rpcCall === 'undefined') {
        return;
      }

      var index = this.rpcCalls.findIndex(function (_ref3) {
        var id = _ref3.id;
        return id === message[0];
      });

      if (index !== -1) {
        this.rpcCalls.splice(index, 1);
      } else {
        this.rpcCalls = [];
      }

      if (code === MessageCode.MSG_CALL_ERROR) {
        var error = new RpcCallError(message[1], message[2]);

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
  }]);

  return WampClient;
}();var WampLogger = /*#__PURE__*/function () {
  function WampLogger(debug) {
    _classCallCheck(this, WampLogger);

    _defineProperty(this, "debug", false);

    _defineProperty(this, "prefix", '%cVue-Wamp: ');

    this.debug = debug;
  }

  _createClass(WampLogger, [{
    key: "info",
    value: function info(text) {
      if (this.debug) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        window.console.info("".concat(this.prefix, "%c").concat(text), 'color: blue; font-weight: 600', 'color: #333333', args);
      }
    }
  }, {
    key: "error",
    value: function error(text) {
      if (this.debug) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        window.console.error("".concat(this.prefix, "%c").concat(text), 'color: red; font-weight: 600', 'color: #333333', args);
      }
    }
  }, {
    key: "warn",
    value: function warn(text) {
      if (this.debug) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        window.console.warn("".concat(this.prefix, "%c").concat(text), 'color: yellow; font-weight: 600', 'color: #333333', args);
      }
    }
  }, {
    key: "event",
    value: function event(text) {
      if (this.debug) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }

        window.console.info("".concat(this.prefix, "%c").concat(text), 'color: blue; font-weight: 600', 'color: #333333', args);
      }
    }
  }]);

  return WampLogger;
}();var defaultOptions = {
  namespace: 'wamp',
  autoReestablish: true,
  autoCloseTimeout: -1,
  debug: false
};// eslint-disable-next-line @typescript-eslint/no-explicit-any

// install function executed by Vue.use()
var install = function installVueWampV1(Vue, options) {
  if (install.installed) return;
  install.installed = true;
  var _options = options,
      namespace = _options.namespace;
  var injectKey = "$".concat(namespace);
  options = _objectSpread2(_objectSpread2({}, defaultOptions), options);
  var wampClient = new WampClient(options.wsuri, new WampLogger(options.debug));

  if (!Object.prototype.hasOwnProperty.call(Vue, injectKey)) {
    Object.defineProperties(Vue, _defineProperty({}, injectKey, {
      get: function get() {
        return wampClient;
      }
    }));
  }

  if (!Object.prototype.hasOwnProperty.call(Vue.prototype, injectKey)) {
    Object.defineProperties(Vue.prototype, _defineProperty({}, injectKey, {
      get: function get() {
        return wampClient;
      }
    }));
  } // Auto install


  if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'Vue')) {
    window.Wamp = wampClient;
  }
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

{
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }
} // Default export is library as a whole, registered via Vue.use()
exports.default=plugin;