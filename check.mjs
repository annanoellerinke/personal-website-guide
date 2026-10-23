import { readFile } from 'node:fs/promises';
import { validateCatalog } from './catalog.mjs';

try {
  const data = JSON.parse(await readFile(new URL('./site.json', import.meta.url), 'utf8'));
  const result = validateCatalog(data, { publish: process.argv.includes('--publish') });
  result.warnings.forEach(message => console.warn(`Note: ${message}`));
  result.errors.forEach(message => console.error(`Fix: ${message}`));
  if (result.errors.length) process.exitCode = 1;
  else console.log('Content format checked. Verify actual destinations and the finished design separately.');
} catch (error) {
  console.error(`Could not check content: ${error.message}`);
  process.exitCode = 1;
}
