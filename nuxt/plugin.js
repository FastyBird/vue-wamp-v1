import Vue from 'vue'

import VueWampV1 from 'vue-wamp-v1'
import defOptions from 'vue-wamp-v1/src/options'

const userOptions = JSON.parse('<%= JSON.stringify(options) %>')
const options = {...defOptions, ...userOptions}
const { namespace } = options
const injectKey = '$' + namespace

export default function NuxtWampPlugin(context, inject) {
  Vue.use(VueWampV1, options)

  if (!context.app[injectKey]) {
    context.app[injectKey] = Vue[injectKey]
  }

  if (context.store && !context.store[injectKey]) {
    context.store[injectKey] = Vue[injectKey]
  }
}
