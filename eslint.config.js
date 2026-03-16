import js from "@eslint/js";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default ts.config(
  {
    ignores: ["eslint.config.js", "dist"], // adiciona isso como primeiro item
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
  prettier
);
