import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        browser: true,
        node: true,
        console: true  // ✅ Add this line to allow `console.log`
      }
    },
    plugins: {
      prettier
    },
    rules: {
      "prettier/prettier": ["error", { singleQuote: true, semi: false }]
    }
  }
];
