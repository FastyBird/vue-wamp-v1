import Vue from 'vue'

import VueWampV1, { WampClientDefaultOptions } from '@fastybird/vue-wamp-v1'

const userOptions = JSON.parse('<%= JSON.stringify(options) %>')
const options = {...WampClientDefaultOptions, ...userOptions}
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
