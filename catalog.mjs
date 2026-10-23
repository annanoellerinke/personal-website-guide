// Content utilities, with no design theme or required category list.
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string';

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function checkURL(value, publish) {
  if (value !== value.trim() || /[\s\u0000-\u001f\u007f]/u.test(value)) {
    return 'Use the exact full URL without spaces or control characters.';
  }
  let parsed;
  try { parsed = new URL(value); } catch { return 'A full URL is required.'; }
  if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
    return 'Use an https, http, or mailto destination.';
  }
  if (parsed.username || parsed.password) return 'Do not include credentials in a link.';
  if (parsed.protocol === 'mailto:' && !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(parsed.pathname)) {
    return 'Use a mailto link to one complete email address.';
  }
  const hostname = parsed.protocol === 'mailto:' ? parsed.pathname.split('@')[1].toLowerCase() : parsed.hostname;
  if (publish && (
    /(^|\.)(example\.(com|org|net)|localhost)$/.test(hostname) ||
    /\.(invalid|test|local)$/.test(hostname) ||
    ['127.0.0.1', '0.0.0.0', '[::1]'].includes(hostname)
  )) return 'Replace the example or local destination before publishing.';
  return null;
}

export function validateCatalog(catalog, { publish = false } = {}) {
  const errors = [], warnings = [];
  if (!plainObject(catalog)) return { errors: ['Content must be a JSON object.'], warnings };
  for (const key of ['name', 'intro']) {
    if (!isText(catalog[key])) errors.push(`${key} must be text.`);
  }
  if (publish && isText(catalog.name) && !catalog.name.trim()) errors.push('Add the approved public name before publishing.');
  if (!Array.isArray(catalog.links)) return { errors: [...errors, 'links must be an array.'], warnings };
  if (catalog.links.length === 0) {
    (publish ? errors : warnings).push('No links yet. Collect the person’s exact destinations.');
  }
  const ids = new Set(), urls = new Set();
  catalog.links.forEach((link, index) => {
    const at = `Link ${index + 1}`;
    if (!plainObject(link)) { errors.push(`${at} must be an object.`); return; }
    if (!isText(link.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(link.id)) errors.push(`${at}: use a simple lowercase id, such as writing.`);
    if (ids.has(link.id)) errors.push(`${at}: id must be unique.`);
    ids.add(link.id);
    for (const key of ['label', 'description', 'url']) {
      if (!isText(link[key])) errors.push(`${at}: ${key} must be text.`);
    }
    if (link.group !== undefined && !isText(link.group)) errors.push(`${at}: group must be text.`);
    if (!Number.isInteger(link.priority) || link.priority < 1) errors.push(`${at}: priority must be a positive whole number.`);
    if (typeof link.confirmed !== 'boolean') errors.push(`${at}: confirmed must be true or false.`);
    if (isText(link.label) && !link.label.trim()) errors.push(`${at}: add a visible label.`);
    if (isText(link.description) && !link.description.trim()) {
      (publish ? errors : warnings).push(`${at}: add a short explanation of what opens.`);
    }
    if (publish && link.confirmed !== true) errors.push(`${at}: the person must supply or approve the exact destination.`);
    if (isText(link.url)) {
      if (!link.url) (publish ? errors : warnings).push(`${at}: destination is missing; the review will not make it clickable.`);
      else {
        const problem = checkURL(link.url, publish);
        if (problem) errors.push(`${at}: ${problem}`);
        if (urls.has(link.url)) warnings.push(`${at}: another entry uses this destination. Confirm that both belong.`);
        urls.add(link.url);
      }
    }
  });
  return { errors, warnings };
}

export function orderedLinks(catalog) {
  return [...catalog.links].sort((a, b) => a.priority - b.priority);
}

export function renderCatalog(catalog, { review = true } = {}) {
  const { errors } = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  const items = orderedLinks(catalog).map(link => {
    const label = escapeHTML(link.label);
    const destination = link.url
      ? `<a href="${escapeHTML(link.url)}" data-link-id="${escapeHTML(link.id)}">${label}</a>`
      : `<span class="catalog-missing">${label} — destination needed</span>`;
    const group = link.group ? `<span class="catalog-group">${escapeHTML(link.group)}</span>` : '';
    const description = link.description ? `<p>${escapeHTML(link.description)}</p>` : '';
    const pending = review && link.url && !link.confirmed ? '<small>Destination awaiting confirmation</small>' : '';
    return `<li>${group}${destination}${description}${pending}</li>`;
  }).join('\n');
  return `${items ? `<ul class="catalog">${items}</ul>` : '<p>No links yet. Add the destinations supplied by the person to site.json.</p>'}`;
}
