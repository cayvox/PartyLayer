import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },
  define: {
    __PROVIDER_VERSION__: JSON.stringify(pkg.version),
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
