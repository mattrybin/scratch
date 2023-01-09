import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    reporters: "verbose",
    includeSource: [
      'src/**/*.ts',
    ],
  },
  define: {
    'import.meta.vitest': false,
  },
  build: {
    lib: {
      formats: ['es', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
    },
  },
})