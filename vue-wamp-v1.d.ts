import Vue, { PluginFunction, VueConstructor } from 'vue';

import { WampClientInterface, WampClientOptionsInterface, RpCallResponse, RpCallPromise } from './src/lib/types';

interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}

declare const VueWampV1: { install: InstallFunction };

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

export default VueWampV1;

export { WampClientInterface, WampClientOptionsInterface, RpCallResponse, RpCallPromise };
