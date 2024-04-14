// eslint.config.js

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked, {
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

// export default [
//   {
//     parser: '@typescript-eslint/parser',
//     parserOptions: {
//       project: './tsconfig.json',
//     },
//     plugins: ['@typescript-eslint'],
//     extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
//     rules: {
//       'react-hooks/exhaustive-deps': 'error',
//     },
//   },
// ];
