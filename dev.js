// dev.js
import { spawn } from 'child_process';
import { register } from 'tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Register path aliases from tsconfig.json
register({
  baseUrl: '.',
  paths: {
    '@/*': ['./client/src/*'],
    '@shared/*': ['./shared/*']
  }
});

// Set environment variable
process.env.NODE_ENV = 'development';

// Start the server using tsx
const server = spawn('node', [
  '--loader', 'tsx', 
  'server/index.ts'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle server process events
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
  }
  process.exit(code);
});

// Forward termination signals to server process
process.on('SIGINT', () => {
  server.kill('SIGINT');
});
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});
