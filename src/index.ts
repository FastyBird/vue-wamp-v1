import { VueConstructor } from 'vue'

import { VueWampDefaults } from 'types'
import { WampClient } from 'client'
import { WampLogger } from 'logger'

const Plugin = {
  install(
    Vue: VueConstructor,
    options: VueWampDefaults,
  ) {
    const wampClient = new WampClient(options.wsuri, new WampLogger(options.debug))

    Object.assign(Vue, { $wamp: wampClient })
    Object.assign(Vue.prototype, { $wamp: wampClient })

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
