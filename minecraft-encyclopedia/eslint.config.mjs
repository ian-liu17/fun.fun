import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [...compat.extends('next/core-web-vitals', 'next/typescript'), { ignores: ['out/**', '.next/**', 'node_modules/**', 'public/offline/**', 'public/game/**', 'next-env.d.ts'] }, {rules:{'@next/next/no-img-element':'off'}}];
export default config;
