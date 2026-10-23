import { renderCatalog, validateCatalog } from './catalog.mjs';

const status = document.getElementById('status');
try {
  const response = await fetch('./site.json');
  if (!response.ok) throw new Error('The content file could not be loaded.');
  const content = await response.json();
  const result = validateCatalog(content);
  if (result.errors.length) throw new Error(result.errors.join(' '));
  document.getElementById('name').textContent = content.name || 'Your content';
  document.getElementById('intro').textContent = content.intro;
  document.getElementById('links').innerHTML = renderCatalog(content);
  status.textContent = result.warnings.join(' ');
} catch (error) {
  document.getElementById('links').textContent = '';
  status.textContent = `Content needs attention: ${error.message}`;
}
