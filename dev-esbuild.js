// dev-esbuild.js
import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build the server code
async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/dev-server.js',
      sourcemap: true,
      minify: false,
      alias: {
        '@shared': resolve(__dirname, 'shared'),
        '@': resolve(__dirname, 'client/src')
      },
      banner: {
        js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);import { register } from 'tsconfig-paths';import { dirname } from 'path';import { fileURLToPath } from 'url';const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);register({ baseUrl: __dirname, paths: { '@shared/*': ['./shared/*'] } });`
      },
    });
    console.log('Server build complete');
    
    // Run the server
    const server = spawn('node', ['dist/dev-server.js'], {
      env: { ...process.env, NODE_ENV: 'development' },
      stdio: 'inherit'
    });
    
    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
    
    // Watch for changes and rebuild
    // This is a simple implementation - you might want to use a proper file watcher
    process.on('SIGINT', () => {
      server.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
