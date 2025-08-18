import espree from "espree";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      parser: espree,
      globals: globals.node, // ให้ตัวแปร Node (module, __dirname, etc.)
    },
  },
];
