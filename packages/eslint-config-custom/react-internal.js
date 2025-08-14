// packages/eslint-config-custom/react-internal.js
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import base from "./base.js";

/**
 * React (library/internal) ESLint config – ต่อยอดจาก base
 * @type {import("eslint").Linter.Config[]}
 */
const reactInternal = [
  ...base,

  // React core rules
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      // Next/React libs อาจรันทั้งฝั่ง browser และ tooling ฝั่ง node
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...(pluginReact.configs.flat.recommended.rules ?? {}),
      // ไม่ต้องใช้ React in scope กับ JSX transform ใหม่
      "react/react-in-jsx-scope": "off",
      // ใช้ TS แทน PropTypes
      "react/prop-types": "off",
    },
  },

  // React Hooks
  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
];

export default reactInternal;
// เผื่อโปรเจ็กต์เก่าที่ยัง import { config } อยู่
export const config = reactInternal;
