import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config} */
export default {
  overrides: [
    {
      files: ["**/*.js"],
      languageOptions: {
        sourceType: "commonjs",
        globals: globals.node,
      },
    },
  ],
  ...pluginJs.configs.recommended,
};
