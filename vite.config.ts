import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      strict: false  // disables the "outside root" restriction
    }
  }
});
