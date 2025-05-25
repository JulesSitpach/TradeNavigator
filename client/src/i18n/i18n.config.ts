export default {
  supportedLanguages: ['en', 'es', 'fr'],
  fallbackLanguage: 'en',
  autoGenerateNamespaces: true,
  translationServices: {
    primary: 'deepl',
    fallback: 'google-translate'
  },
  extractionPaths: [
    '/client/src/pages',
    '/client/src/components', 
    '/client/src/features'
  ],
  outputPath: '/client/src/i18n/locales/generated',
  namespaces: [
    'common',
    'navigation', 
    'features',
    'pricing',
    'forms',
    'landing',
    'files',
    'documents'
  ]
}