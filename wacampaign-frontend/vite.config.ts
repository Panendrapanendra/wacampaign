
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Use relative asset paths for the packaged Electron application.
  base: './',

  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '127.0.0.1',

    watch: {
      // Do not watch backend runtime files and local session data.
      ignored: [
        '**/wacampaign-backend/**',
        '**/release-builds/**',
        '**/.wwebjs_auth/**',
        '**/.wwebjs_cache/**',
      ],
    },
  },

  preview: {
    host: '127.0.0.1',
  },
});
