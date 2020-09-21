import Vue from 'vue'

import VueWampV1 from '@fastybird/vue-wamp-v1'
import defOptions from '@fastybird/vue-wamp-v1/src/lib/options'

const userOptions = JSON.parse('<%= JSON.stringify(options) %>')
const options = {...defOptions, ...userOptions}
const { namespace } = options
const injectKey = '$' + namespace

export default function NuxtVueWampV1Plugin(context) {
  Vue.use(VueWampV1, options)

  if (!context.app[injectKey]) {
    context.app[injectKey] = Vue[injectKey]
  }

  if (context.store && !context.store[injectKey]) {
    context.store[injectKey] = Vue[injectKey]
  }
}
