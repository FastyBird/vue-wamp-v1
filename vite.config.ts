import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import del from 'rollup-plugin-delete';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		eslintPlugin(),
		dts({
			outputDir: 'dist',
			staticImport: true,
			insertTypesEntry: true,
			skipDiagnostics: true,
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, './src/entry.ts'),
			name: 'vue-wamp-v1',
			fileName: (format) => `vue-wamp-v1.${format}.js`,
		},
		rollupOptions: {
			plugins: [
				// @ts-ignore
				del({
					targets: ['dist/types', 'dist/Client.ts', 'dist/entry.ts', 'dist/Logger.ts', 'dist/RpcCallError.ts', 'dist/useWsServerClient.ts'],
					hook: 'generateBundle',
				}),
			],
			external: ['vue'],
			output: {
				sourcemap: true,
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue: 'Vue',
				},
			},
		},
		sourcemap: true,
		target: 'esnext',
	},
});
