import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  prettier,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        AbortController: "readonly",
        navigator: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLTextAreaElement: "readonly",
        SVGCircleElement: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        BeforeUnloadEvent: "readonly",
        Event: "readonly",
        DragEvent: "readonly",
        CSS: "readonly",
        confirm: "readonly",
        alert: "readonly",
        prompt: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        addEventListener: "readonly",
        removeEventListener: "readonly",
        structuredClone: "readonly",
        btoa: "readonly",
        atob: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
    },
  },
  {
    ignores: [
      "dist/",
      "dist-web/",
      "dist-verify/",
      "node_modules/",
      "src-tauri/target/",
      "cloudflare-worker/",
      "api/",
      "scripts/",
      "public/sw.js",
    ],
  }
);
