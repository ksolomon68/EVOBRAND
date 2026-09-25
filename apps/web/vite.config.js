import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		cors: true,
		allowedHosts: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
		// Prevent multiple React instances (fixes @react-pdf/renderer hook errors)
		dedupe: ['react', 'react-dom'],
	},
	build: {
		rollupOptions: {
			output: {
				// Keep the framework in its own long-cached chunk so page chunks stay small.
				manualChunks: {
					react: ['react', 'react-dom', 'react-router-dom'],
				},
			},
		},
	},
});
