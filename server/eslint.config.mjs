import rootConfig from '../eslint.config.js';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
];
