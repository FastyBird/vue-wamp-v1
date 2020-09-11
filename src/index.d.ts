import Vue from 'index.d.ts'

import { WampClientInterface } from 'types'

declare module 'vue/types/vue' {
  interface Vue {
    $wamp: WampClientInterface
  }

  interface VueConstructor {
    $wamp: WampClientInterface
  }
}
