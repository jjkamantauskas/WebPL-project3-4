import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
      "import/no-extraneous-dependencies": "off",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
];