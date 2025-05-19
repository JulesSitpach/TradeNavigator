// tsconfig-paths-bootstrap.js
import { register } from 'tsconfig-paths';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register path aliases based on the compiled output directory
register({
  baseUrl: '.',
  paths: {
    '@shared/*': [resolve(__dirname, './shared/*')],
    '@/*': [resolve(__dirname, './client/src/*')]
  }
});
