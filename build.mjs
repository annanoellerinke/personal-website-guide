import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { validateCatalog } from './catalog.mjs';

const root = new URL('./', import.meta.url);
const content = JSON.parse(await readFile(new URL('site.json', root), 'utf8'));
const { errors } = validateCatalog(content);
if (errors.length) throw new Error(errors.join('\n'));
await rm(new URL('dist/', root), { recursive: true, force: true });
await mkdir(new URL('dist/', root), { recursive: true });
for (const file of ['index.html', 'review.css', 'review.mjs', 'site.json', 'catalog.mjs']) {
  await cp(new URL(file, root), new URL(`dist/${file}`, root));
}
console.log('Built dist/. The supplied page is a content review, not a finished website design.');
