import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { EDIT_MODE_STYLES } from './visual-editor-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default function inlineEditDevPlugin() {
  return {
    name: 'vite:inline-edit-dev',
    apply: 'serve',
    transformIndexHtml() {
      const scriptPath = resolve(__dirname, 'edit-mode-script.js');
      let scriptContent = readFileSync(scriptPath, 'utf-8');
      
      // Corregir las importaciones para que funcionen desde la raíz
      scriptContent = scriptContent.replace(
        "import { POPUP_STYLES } from './visual-editor-config.js';",
        "import { POPUP_STYLES } from '/plugins/visual-editor/visual-editor-config.js';"
      );

      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: scriptContent,
          injectTo: 'body'
        },
        {
          tag: 'style',
          children: EDIT_MODE_STYLES,
          injectTo: 'head'
        }
      ];
    }
  };
}
