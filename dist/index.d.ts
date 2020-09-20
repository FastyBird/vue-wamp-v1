import { VueConstructor } from 'vue';
import { VueWampDefaults, WampClientInterface } from 'types';
export { WampClientInterface, VueWampDefaults };
declare const Plugin: {
    installed: boolean;
    install(Vue: VueConstructor, options: VueWampDefaults): void;
};
export default Plugin;
