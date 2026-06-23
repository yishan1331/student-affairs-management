import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import * as path from 'path';

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
			manifest: {
				name: '學校課程管理系統',
				short_name: 'Astrid',
				description:
					'學校課程管理系統 - 學校、課程、學生、出勤與成績管理',
				lang: 'zh-Hant',
				theme_color: '#FC6627',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
				// 主 bundle 約 4MB（未做 code-split），預設 2MB 上限會略過 → 調高才能離線可用
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
				navigateFallback: '/index.html',
				// API 為跨網域呼叫，不走 SW；明確排除避免被導向 index.html
				navigateFallbackDenylist: [/^\/api/],
				cleanupOutdatedCaches: true,
			},
			devOptions: {
				// dev 預設關閉，避免開發時 SW 快取造成困擾；需測試 PWA 時改 true
				enabled: false,
			},
		}),
	],
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
