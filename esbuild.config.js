// esbuild.config.js
import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    external: [
      // List external dependencies to not bundle
      'express',
      'ioredis',
      '@neondatabase/serverless',
      'ws',
      'firebase-admin',
      'firebase-functions',
      // Add other server dependencies you don't want to bundle
    ],
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@': resolve(__dirname, 'client/src')
    },
    // Ensure shared code is properly included
    mainFields: ['module', 'main'],
    banner: {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);import { register } from 'tsconfig-paths';import { dirname } from 'path';import { fileURLToPath } from 'url';const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);register({ baseUrl: __dirname, paths: { '@shared/*': ['./shared/*'] } });`
    },
  });
  console.log('Server build complete');
} catch (error) {
  console.error('Server build failed:', error);
  process.exit(1);
}
