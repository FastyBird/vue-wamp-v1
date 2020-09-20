import _Vue from 'vue'
import { Store } from 'vuex'

import { WampClientInterface } from '../src/types'

declare module 'vue/types/vue' {
  interface Vue {
    $wamp: WampClientInterface
  }

  interface VueConstructor {
    $wamp: WampClientInterface
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends _Vue> {
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

declare module 'vuex/types/index' {
  interface Store<S> {
    $wamp: WampClientInterface
  }
}

export default interface Plugin {
  install(Vue: _Vue, options?: {}): void
}
