import { VueConstructor } from 'vue';
import { VueWampDefaults } from 'types';
declare const Plugin: {
    install(Vue: VueConstructor, options: VueWampDefaults): void;
};
export default Plugin;
