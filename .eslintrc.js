module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'no-unused-expressions': 'off',
    'generator-star-spacing': ['error', { before: false, after: true }],
    'no-restricted-syntax': 'off',
    'no-plusplus': 'off',
    'arrow-parens': 'off',
  },
};
