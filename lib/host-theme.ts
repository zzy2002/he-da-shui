export type HostThemeContext = {
 theme?: unknown;
 styles?: { variables?: Record<string, unknown> };
};
/** Apply standard MCP Apps theme tokens, including later partial host updates. */
export function applyHostContext(context: HostThemeContext | undefined, root: HTMLElement = document.documentElement) {
 if (!context || typeof context !== "object") return;
 if (context.theme === "light" || context.theme === "dark") {
  root.dataset.hostTheme = context.theme;
  root.style.setProperty("color-scheme", context.theme);
 }
 const variables=context.styles?.variables;
 if (!variables || typeof variables !== "object") return;
 for (const [name,value] of Object.entries(variables)) {
  if (/^--(?:color-|font-|border-|shadow-)/.test(name) && typeof value === "string") {
   root.style.setProperty(name,value);
  }
 }
}
