import { VueConstructor } from 'vue'

import { VueWampDefaults, WampClientInterface } from 'types'
import { WampClient } from 'client'
import { WampLogger } from 'logger'
import defaultOptions from 'options'

export { WampClientInterface, VueWampDefaults }

const Plugin = {
  installed: false,

  install(
    Vue: VueConstructor,
    options: VueWampDefaults,
  ) {
    options = {...defaultOptions, ...options};

    const {namespace} = options
    const injectKey = `$${namespace}`

    if (this.installed) {
      return
    }

    this.installed = true

    const wampClient = new WampClient(options.wsuri, new WampLogger(options.debug))

    if (!Vue[injectKey]) {
      Object.defineProperties(Vue, {
        [injectKey]: {
          get() {
            return wampClient;
          },
        },
      })
    }

    if (!Vue.prototype[injectKey]) {
      Object.defineProperties(Vue.prototype, {
        [injectKey]: {
          get() {
            return wampClient
          },
        },
      })
    }

    // Auto install
    if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'Vue')) {
      (window as any).Wamp = wampClient
    }
  },
}

// Auto install
if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'Vue')) {
  (window as any).Vue.use(Plugin.install)
}

export default Plugin
