/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "markdown-it-task-lists" {
  import type { PluginWithOptions } from "markdown-it";
  const taskLists: PluginWithOptions;
  export default taskLists;
}

declare module "markdown-it-ins" {
  import type { PluginSimple } from "markdown-it";
  const ins: PluginSimple;
  export default ins;
}

declare module "markdown-it-mark" {
  import type { PluginSimple } from "markdown-it";
  const mark: PluginSimple;
  export default mark;
}

declare module "markdown-it-sub" {
  import type { PluginSimple } from "markdown-it";
  const sub: PluginSimple;
  export default sub;
}

declare module "markdown-it-sup" {
  import type { PluginSimple } from "markdown-it";
  const sup: PluginSimple;
  export default sup;
}
