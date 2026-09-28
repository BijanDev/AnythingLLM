import { renameSync, copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`Running frontend post build script...`);
const indexPath = path.resolve(__dirname, '../dist/index.html');
const ssrIndexPath = path.resolve(__dirname, '../dist/_index.html');

if (process.env.VERCEL) {
  console.log(`Vercel build detected: preserving index.html for static hosting.`);
  if (existsSync(indexPath)) {
    copyFileSync(indexPath, ssrIndexPath);
  }
} else {
  renameSync(indexPath, ssrIndexPath);
  console.log(`index.html renamed to _index.html so SSR of the index page can be assumed.`);
}