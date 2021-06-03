# FastyBird WAMPv1 websocket client library

[![Latest stable](https://badgen.net/npm/v/@fastybird/vue-wamp-v1?cache=300&style=flast-square)](https://www.npmjs.com/package/@fastybird/vue-wamp-v1)
[![Downloads total](https://badgen.net/npm/dt/@fastybird/vue-wamp-v1?cache=300&style=flast-square)](https://www.npmjs.com/package/@fastybird/vue-wamp-v1)
[![Licence](https://badgen.net/npm/license/@fastybird/vue-wamp-v1?cache=300&style=flast-square)](https://www.npmjs.com/package/@fastybird/vue-wamp-v1)
![Types](https://badgen.net/npm/types/@fastybird/vue-wamp-v1?cache=300&style=flast-square)

## What is FastyBird WAMPv1 websocket client library?

This library is very simple implementation of [WAMP](https://wamp-proto.org) in version 1 for [Vue](https://vuejs.org) framework.

## Installation

The best way to install **@fastybird/vue-wamp-v1** is using [Yarn](https://yarnpkg.com/):

```sh
yarn add @fastybird/vue-wamp-v1
```

or if you prefer npm:

```sh
npm install @fastybird/vue-wamp-v1
```

## Setup in your application

Register Vue plugin:

```js
import Vue from 'vue'
import VueWamp from '@fastybird/vue-wamp-v1'

Vue.use(VueWamp, {
    wsuri: 'ws://your.socker.server.com:1234'
})
```

#### Options:

- `wsuri` - is required option and with this field is representing your wamp server address
- `namespace` - default value is `wamp` and this option represent plugin name in you vue instance
- `debug` - default is `false` and this option is to enable or disable console log of wamp events

## Usage

In you component you could establish connection and subscribe to wamp events:

```vue
new Vue({
    mounted(): {
        this.$wamp.open() // Establish connection with server

        this.$wamp.subscribe(
          '/topic/path',
          (data) => {
            console.log(data) // Data sent by server to the topic
          },
        )
    },
    destroyed(): {
      this.$wamp.close() // Close opened connection with server
    },
    methods: {
        clickButton: (data) => {
            // Publish to specific topic
            this.$wamp.publish('/topic/path', 'Hello world')
        },

        clickOtherButton: (data) => {
            // RPC
            this.$wamp.call('/topic/path', 'Hello world')
                .then(() => {
                  console.log('Call was successful')
                })
                .catch(() => {
                    console.log('Something went wrong')
                })
        },
    }
})
```

## Typescript setup

Add the types to your `"types"` array in **tsconfig.json**.

```json
{
  "compilerOptions": {
    "types": [
      "@fastybird/vue-wamp-v1"
    ]
  }
}
```

## Nuxt support

This module has also support for [Nuxt](https://nuxtjs.org) as a module. It could be installed via `nuxt.config.js/ts`

```js
export default {
  
  modules: [
      '@fastybird/vue-wamp-v1/@nuxt',
  ],

}
```

***
Homepage [https://www.fastybird.com](https://www.fastybird.com) and repository [https://github.com/FastyBird/vue-wamp-v1](https://github.com/FastyBird/vue-wamp-v1).
