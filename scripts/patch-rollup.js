import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const nativeJsPath = path.resolve(__dirname, '../node_modules/rollup/dist/native.js')

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8')
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    const target = `const nativeModule = requireWithFriendlyError(\n\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`\n);`
    const replacement = `let nativeModule;
try {
\tnativeModule = requireWithFriendlyError(
\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
\t);
} catch (e) {
\ttry {
\t\tnativeModule = require('@rollup/wasm-node/dist/native.js');
\t} catch (wasmError) {
\t\tthrow e;
\t}
}`
    if (content.includes(target)) {
      content = content.replace(target, replacement)
      fs.writeFileSync(nativeJsPath, content, 'utf8')
      console.log('Applied @rollup/wasm-node fallback patch to rollup/dist/native.js')
    }
  }
}
