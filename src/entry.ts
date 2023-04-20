import { App } from 'vue';

// Import library
import wampClient, { Client } from '@/Client';
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

			wampClient.host = pluginOptions.host;
			wampClient.logger = new Logger(pluginOptions.debug);

			app.provide(key, this.wampClient);
		},
	};

	return plugin;
}

export { Client, useWampV1Client, wampClient };

export * from '@/types';
