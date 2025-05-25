import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// Fix ES module default export issue
const traverseDefault = traverse.default || traverse;

function extractTranslationKeys(sourceCode) {
  const keys = new Set();
  
  const ast = parse(sourceCode, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });

  traverseDefault(ast, {
    CallExpression(path) {
      const callee = path.get('callee');
      if (
        callee.isIdentifier({ name: 't' }) || 
        callee.matchesPattern('i18next.t')
      ) {
        const firstArg = path.get('arguments.0');
        if (firstArg.isStringLiteral()) {
          keys.add(firstArg.node.value);
        }
      }
    }
  });

  return Array.from(keys);
}

function generateTranslationFiles(projectRoot) {
  const componentDirs = [
    '/client/src/pages',
    '/client/src/components',
    '/client/src/features'
  ];

  const globalTranslations = {};

  componentDirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`Directory ${fullPath} does not exist, skipping...`);
      return;
    }
    
    fs.readdirSync(fullPath).forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(fullPath, file);
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        const keys = extractTranslationKeys(sourceCode);
        
        if (keys.length > 0) {
          const componentName = path.basename(file, path.extname(file));
          globalTranslations[componentName] = keys;
          console.log(`Found ${keys.length} translation keys in ${componentName}`);
        }
      }
    });
  });

  // Generate translation files
  const languages = ['en', 'es'];
  languages.forEach(lang => {
    const translationOutput = {};
    
    Object.entries(globalTranslations).forEach(([component, keys]) => {
      translationOutput[component] = keys.reduce((acc, key) => {
        acc[key] = lang === 'en' 
          ? `Default ${key} Text` 
          : `Texto ${key} Traducido`;
        return acc;
      }, {});
    });

    const outputDir = path.join(projectRoot, `client/src/i18n/locales/generated/${lang}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'auto-generated.json'), 
      JSON.stringify(translationOutput, null, 2)
    );
    
    console.log(`Generated ${lang} translations: ${outputDir}/auto-generated.json`);
  });
  
  console.log('Translation extraction complete!');
}

// Run the extraction
const projectRoot = process.cwd();
generateTranslationFiles(projectRoot);