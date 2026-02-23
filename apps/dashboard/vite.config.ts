import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
	plugins: [react()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "./src/styles/variables.scss";`,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
