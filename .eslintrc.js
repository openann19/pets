module.exports = {
  root: true,
  // This tells ESLint to load the config from the package
  extends: ["eslint:recommended", "prettier"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
    react: {
      version: "detect",
    },
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
      },
    },
  ],
};
