const tseslint = require("typescript-eslint");

module.exports = tseslint.config({
  files: ["src/**/*.ts"],
  languageOptions: {
    globals: {
      node: true,
      es2022: true,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": "off",
  },
});
