import { defineConfig } from 'vite'; // Import defineConfig from Vite
import path from 'path'
import vue from '@vitejs/plugin-vue'; // Import Vue plugin for Vite

// Define Vite configuration
export default defineConfig({
    plugins: [vue()], // Register Vue plugin
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'), // Entry file for the library
            name: 'VueCaptchaSwitcher', // Name of the library
            fileName: (format) => `vue-captcha-switcher.${format}.js`, // Output filename format
            formats: ['esm', 'umd', 'cjs'], // Supported formats
        },
        rollupOptions: {
            external: ['vue'], // External dependencies
            output: {
                globals: {
                    vue: 'Vue', // Global variable name for Vue
                },
            },
        },
    },
});
