import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import cp from 'vite-plugin-cp';

export default defineConfig({
  plugins: [
    vue(),
    cp(
    {
      targets:
      [
        {
          src: 'dist/index.html',
          dest: 'laravel-api/resources/views',
          rename: 'index.blade.php'
        },
        {
          src: 'dist/assets',
          dest: 'laravel-api/public/assets'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.vue']
  }
});
