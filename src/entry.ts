import _Vue from 'vue';

// Import library
import WampClient from '@/lib/client';
import WampLogger from '@/lib/logger';
import { InstallFunction } from '@/types/vue-wamp-v1'

export const defaultOptions = {
    namespace: 'wamp',
    autoReestablish: true,
    autoCloseTimeout: -1,
    debug: false,
}

// install function executed by Vue.use()
const install: InstallFunction = function installVueWampV1(Vue: typeof _Vue, options) {
  if (install.installed) return;
  install.installed = true;

  const {namespace} = options;
  const injectKey = `$${namespace}`;

  options = {...defaultOptions, ...options};

  const wampClient = new WampClient(options.wsuri, new WampLogger(options.debug));

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
// @ts-ignore
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
