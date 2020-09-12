import { VueConstructor } from 'vue';
import { VueWampDefaults } from 'types';
declare const Plugin: {
    installed: boolean;
    install(Vue: VueConstructor, options: VueWampDefaults): void;
};
export default Plugin;
