// scripts/prepare-firebase.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Make sure the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run the build script first.');
  process.exit(1);
}

// Copy the Firebase Functions entry point
try {
  fs.copyFileSync(
    path.resolve(rootDir, 'server', 'firebase-functions.js'), 
    path.resolve(distDir, 'index.js')
  );
  console.log('Firebase Functions entry point created at dist/index.js');
} catch (error) {
  console.error('Error copying Firebase Functions entry point:', error);
  process.exit(1);
}

// Copy the shared directory to dist
try {
  // Create shared directory if it doesn't exist
  const distSharedDir = path.resolve(distDir, 'shared');
  if (!fs.existsSync(distSharedDir)) {
    fs.mkdirSync(distSharedDir, { recursive: true });
  }
  
  // Copy all files from shared to dist/shared
  const sharedDir = path.resolve(rootDir, 'shared');
  const sharedFiles = fs.readdirSync(sharedDir);
  
  for (const file of sharedFiles) {
    const srcPath = path.resolve(sharedDir, file);
    const destPath = path.resolve(distSharedDir, file);
    
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  console.log('Shared files copied to dist/shared');
} catch (error) {
  console.error('Error copying shared files:', error);
  process.exit(1);
}

// Copy Firebase Functions package.json
try {
  fs.copyFileSync(
    path.resolve(rootDir, 'functions-package.json'), 
    path.resolve(distDir, 'package.json')
  );
  console.log('Firebase Functions package.json copied to dist/package.json');
} catch (error) {
  console.error('Error copying Functions package.json:', error);
  process.exit(1);
}

console.log('Firebase Functions preparation complete!');
