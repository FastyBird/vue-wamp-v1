import _Vue from 'vue'

// Import library
import WampClient from '@/lib/Client'
import WampLogger from '@/lib/Logger'
import { InstallFunction, WampClientOptionsInterface } from '@/types/vue-wamp-v1'

const defaultOptions = {
    namespace: 'wamp',
    autoReestablish: true,
    autoCloseTimeout: -1,
    debug: false,
}

// install function executed by Vue.use()
const install: InstallFunction<WampClientOptionsInterface> = function installVueWampV1(Vue: typeof _Vue, options) {
  if (install.installed) return;
  install.installed = true;

  const pluginOptions = {...defaultOptions, ...options};

  const { namespace } = pluginOptions;
  const injectKey = `$${namespace}`;

  const wampClient = new WampClient(pluginOptions.wsuri as string, new WampLogger(pluginOptions.debug));

  if (!Object.prototype.hasOwnProperty.call(Vue, injectKey)) {
    Object.defineProperties(Vue, {
      [injectKey]: {
        get() {
          return wampClient;
        },
      },
    });
  }

  if (!Object.prototype.hasOwnProperty.call(Vue.prototype, injectKey)) {
    Object.defineProperties(Vue.prototype, {
      [injectKey]: {
        get() {
          return wampClient
        },
      },
    });
  }

  // Auto install
  if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'Vue')) {
    (window as any).Wamp = wampClient;
  }
};

// Create module definition for Vue.use()
const plugin = {
  install,
};

// To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare
/* global window, global */
// eslint-disable-next-line no-constant-condition
if ('false' === process.env.ES_BUILD) {
  let GlobalVue = null;
  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalVue = (global as any).Vue;
  }
  if (GlobalVue) {
    (GlobalVue as typeof _Vue).use(plugin);
  }
}

// Default export is library as a whole, registered via Vue.use()
export default plugin;

export { WampClient };

export * from '@/types/vue-wamp-v1';
