module.exports = {
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: '**/tsconfig.json'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    'multiline-ternary': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'prettier/prettier': ['error'],
    'generator-star-spacing': ['error', { before: false, after: true }],
    'yield-star-spacing': ['error', { before: false, after: true }]
  }
}
