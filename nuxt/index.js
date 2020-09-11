const { resolve } = require('path')

module.exports = function nuxtVueVueWampV1(moduleOptions) {
  const options = this.options.wamp || moduleOptions

  this.addPlugin({
    ssr: false,
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'vue-wamp-v1.js',
    options,
  })
}

module.exports.meta = require('../package.json')
