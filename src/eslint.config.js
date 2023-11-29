const { FlatCompat } = require("@eslint/eslintrc")  // 後方互換性のために用意されているClassのため使用は最小限にする。
const compat = new FlatCompat()
const typescriptParser = require('@typescript-eslint/parser');
const pluginUnusedImport = require('eslint-plugin-unused-imports');
// const eslintPluginImport = require('eslint-plugin-import');  // FlatCompatにImportプラグインが入っているためコメントアウトしているが、FlatCompatが外せたらこちらを使う。
const esLintConfigPrettier = require('eslint-config-prettier');

const jsRules = {
  // JS・TSに共通のルール
  'id-length': 'off', // import命名の文字数
  'import/order': 'error', //importプラグインの設定
  'max-lines-per-function': 'off', //Function内の行数
  // eslint-disable-next-line no-magic-numbers
  'max-statements': ['error', 50000], // Function内のStatement数(;やif)
  // eslint-disable-next-line no-magic-numbers
  'max-lines': ['error', 5000], // 1ファイルあたりの行数
  'react-hooks/exhaustive-deps': 'off', // 依存関係チェック(userEffectでWarningが出るためOFF)
  'no-magic-numbers': [
    'error',
    {
      ignore: [0, 1],
    },
  ], // マジックナンバー(0と1は無視)
  'one-var': 'off', //定数を連結する
  'prefer-named-capture-group': 'off', // 正規表現にキャプチャグループ（名前）をつける
  'sort-imports': 'off', // importのソート(importプラグインに任せるためoff)
  'sort-keys': 'off', // keyのソート
  'sort-vars': 'off', // varのソート
  'unused-imports/no-unused-imports': 'error', // unused-importsプラグインの設定
};
const tsRules = {
  // TSのみのルール
};

module.exports = [
  esLintConfigPrettier,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: jsRules,
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      'unused-imports': pluginUnusedImport,
      // import: eslintPluginImport,  // FlatCompatにImportプラグインが入っているためコメントアウトしているが、FlatCompatが外せたらこちらを使う。
    },
    rules: {
      ...jsRules,
      ...tsRules,
    },
  },
];
