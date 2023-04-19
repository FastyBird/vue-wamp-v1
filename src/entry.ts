import { App } from 'vue';

// Import library
import { Client } from '@/Client';
import { Logger } from '@/Logger';
import { key, useWampV1Client } from '@/useWampV1Client';
import { InstallFunction, PluginOptions } from '@/types';

export const WampClientDefaultOptions = {
	autoReestablish: true,
	autoCloseTimeout: -1,
	debug: false,
};

export function createWampV1Client(): InstallFunction {
	const plugin: InstallFunction = {
		install(app: App, options: PluginOptions) {
			if (this.installed) {
				return;
			}
			this.installed = true;

			const pluginOptions = { ...WampClientDefaultOptions, ...options };

			const wampClient = new Client(pluginOptions.wsuri as string, new Logger(pluginOptions.debug));

			app.provide(key, wampClient);
		},
	};

	return plugin;
}

export { Client, useWampV1Client };

export * from '@/types';
