// Environment validation for TradeNavigator Replit setup
console.log('🔍 TradeNavigator Environment Validation');
console.log('=====================================');

// Check Node.js version
console.log(`Node.js version: ${process.version}`);

// Check environment
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if we're in Replit
console.log(`Running in Replit: ${process.env.REPL_ID ? 'Yes' : 'No'}`);

// Validate key directories
import { existsSync } from 'fs';
import { join } from 'path';

const checkPaths = [
  'client',
  'server', 
  'shared',
  'package.json',
  '.replit',
  'vite.config.ts'
];

console.log('\n📁 Project Structure:');
checkPaths.forEach(path => {
  const exists = existsSync(path);
  console.log(`${exists ? '✅' : '❌'} ${path}`);
});

console.log('\n🎯 Ready to launch TradeNavigator!');
console.log('Run "npm run dev" to start the development server.');
