// scripts/test-server-startup.js
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

console.log('Building server with esbuild...');
try {
  // Run the build
  execSync('node esbuild.config.js', { 
    cwd: rootDir, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' } 
  });
  
  // Try to start the server (with a timeout to prevent it from running indefinitely)
  console.log('Testing server startup...');
  execSync('node dist/index.js', { 
    cwd: rootDir, 
    timeout: 5000, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' } 
  });
  
  console.log('Server started successfully!');
} catch (error) {
  console.error('Error during server test:', error.message);
  process.exit(1);
}
