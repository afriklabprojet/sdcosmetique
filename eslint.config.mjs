import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Dev/util scripts (CommonJS — require() intentionnel)
    // [SEC-L4] server.js gère le service-role/le socket LiteSpeed — on le
    // linte désormais ; seuls les scripts de dev/CI restent ignorés.
    "ecosystem.config.js",
    "scripts/**",
  ]),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // eslint-plugin-sonarjs non installé — désactivation de la règle orpheline
      'sonarjs/cognitive-complexity': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      // no-floating-promises / no-unnecessary-type-assertion nécessitent le
      // typed linting (parserOptions.project), non configuré ici — les
      // ajouter casserait `bun run lint` immédiatement.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // server.js est un entrypoint Node CommonJS (cf. LSNODE_SOCKET) : require()
    // y est légitime, contrairement au reste du code applicatif TypeScript/ESM.
    files: ['server.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);

export default eslintConfig;
