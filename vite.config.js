import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ fallback: '404.html' }),
      paths: {
        base: process.env.NODE_ENV === 'production' ? '/health-charts' : ''
      },
      files: { assets: 'public' }
    })
  ]
});
