import Vue from 'vue'
import VueWampV1 from 'vue-wamp-v1'

Vue.use(VueWampV1, <%= serialize(options) %>)
