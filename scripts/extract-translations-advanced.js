import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractTranslationKeys(projectRoot) {
  const translationKeys = new Set();
  
  // Find all source files
  const files = globSync(`${projectRoot}/client/src/**/*.{tsx,ts,jsx,js}`);
  
  console.log(`Scanning ${files.length} files for translation keys...`);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Enhanced regex patterns for different translation patterns
      const patterns = [
        /t\(['"]([^'"]+)['"][^)]*\)/g,
        /useTranslation\([^)]*\).*?t\(['"]([^'"]+)['"]/g,
        /translateKey\(['"]([^'"]+)['"]/g,
        /i18n\.t\(['"]([^'"]+)['"]/g
      ];
      
      patterns.forEach(pattern => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && !match[1].includes('{{')) {
            translationKeys.add(match[1]);
          }
        }
      });
    } catch (error) {
      console.warn(`Error reading file ${file}:`, error.message);
    }
  });

  return Array.from(translationKeys).sort();
}

function generateComprehensiveTranslationFiles(keys) {
  const languages = {
    en: 'English',
    es: 'Spanish'
  };
  
  Object.keys(languages).forEach(lang => {
    const translations = {};
    
    keys.forEach(key => {
      // Organize by namespace
      const parts = key.split('.');
      if (parts.length > 1) {
        const namespace = parts[0];
        const keyName = parts.slice(1).join('.');
        
        if (!translations[namespace]) {
          translations[namespace] = {};
        }
        
        translations[namespace][keyName] = lang === 'en' 
          ? `${keyName.charAt(0).toUpperCase() + keyName.slice(1)} (EN)`
          : `${keyName.charAt(0).toUpperCase() + keyName.slice(1)} (ES)`;
      } else {
        translations[key] = lang === 'en' 
          ? `${key.charAt(0).toUpperCase() + key.slice(1)} Translation`
          : `Traducción ${key.charAt(0).toUpperCase() + key.slice(1)}`;
      }
    });

    // Ensure directories exist
    const outputDir = path.join(process.cwd(), `public/locales/${lang}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'generated.json'),
      JSON.stringify(translations, null, 2)
    );
    
    console.log(`Generated ${lang} translations: ${keys.length} keys`);
  });
}

function generateNamespaceFiles(keys) {
  const namespaces = {};
  
  keys.forEach(key => {
    const parts = key.split('.');
    if (parts.length > 1) {
      const namespace = parts[0];
      const keyName = parts.slice(1).join('.');
      
      if (!namespaces[namespace]) {
        namespaces[namespace] = [];
      }
      namespaces[namespace].push(keyName);
    }
  });
  
  console.log('Discovered namespaces:', Object.keys(namespaces));
  return namespaces;
}

// Run comprehensive extraction
const projectRoot = process.cwd();
console.log('🚀 Starting comprehensive translation extraction...');

const keys = extractTranslationKeys(projectRoot);
console.log(`📝 Discovered ${keys.length} unique translation keys`);

const namespaces = generateNamespaceFiles(keys);
generateComprehensiveTranslationFiles(keys);

console.log('✅ Advanced translation extraction complete!');
console.log('Generated files in public/locales/{lang}/generated.json');