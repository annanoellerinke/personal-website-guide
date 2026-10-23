import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, renderCatalog, orderedLinks } from './catalog.mjs';

const make = (overrides = {}) => ({
  name: 'Test author', intro: 'Test content only.', links: [{
    id: 'writing', label: 'Read my work', description: 'Essays and notes.',
    url: 'https://writer.example.org/posts?ref=chosen&campaign=launch',
    group: 'Writing', priority: 1, confirmed: true, ...overrides
  }]
});

test('blank content can be reviewed but cannot pass publication checks', () => {
  const blank = { name: '', intro: '', links: [] };
  assert.deepEqual(validateCatalog(blank).errors, []);
  assert.equal(validateCatalog(blank, { publish: true }).errors.length, 2);
});

test('missing and unconfirmed destinations block publishing and do not become placeholder links', () => {
  const draft = make({ url: '', confirmed: false });
  assert.match(validateCatalog(draft, { publish: true }).errors.join(' '), /exact destination/);
  assert.match(validateCatalog(draft, { publish: true }).errors.join(' '), /destination is missing/);
  assert.doesNotMatch(renderCatalog(draft), /<a /);
});

test('affiliate URL contents are preserved exactly in escaped markup', () => {
  const data = make({ url: 'https://shop.example.org/items?ref=a%2Bb&campaign=one%20two#item' });
  assert.match(renderCatalog(data), /href="https:\/\/shop\.example\.org\/items\?ref=a%2Bb&amp;campaign=one%20two#item"/);
  assert.equal(data.links[0].url, 'https://shop.example.org/items?ref=a%2Bb&campaign=one%20two#item');
});

test('unsafe URLs and credentials cannot render', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', '//example.org', 'https://user:secret@example.org', 'https://example.org/a\nb']) {
    assert.ok(validateCatalog(make({ url })).errors.length, url);
    assert.throws(() => renderCatalog(make({ url })));
  }
});

test('example and local destinations cannot pass the publication check', () => {
  for (const url of ['https://writer.example.org/', 'https://thing.invalid/', 'http://localhost:4173/', 'http://127.0.0.1/', 'mailto:hello@example.com']) {
    assert.match(validateCatalog(make({ url }), { publish: true }).errors.join(' '), /example or local/);
  }
});

test('valid HTTPS and mailto destinations pass content checks without network calls', () => {
  for (const url of ['https://www.iana.org/domains/reserved', 'mailto:reader@iana.org']) {
    assert.deepEqual(validateCatalog(make({ url }), { publish: true }).errors, []);
  }
});

test('labels, descriptions, and group text are escaped', () => {
  const html = renderCatalog(make({ label: '<img src=x onerror=alert(1)>', description: '<script>bad</script>', group: 'A & B' }));
  assert.doesNotMatch(html, /<img|<script/);
  assert.match(html, /&lt;img/);
  assert.match(html, /A &amp; B/);
});

test('ordering is stable and leaves the source untouched', () => {
  const data = make();
  data.links = [
    { ...data.links[0], id: 'secondary', priority: 3 },
    { ...data.links[0], id: 'first', priority: 1 },
    { ...data.links[0], id: 'also-first', priority: 1 }
  ];
  assert.deepEqual(orderedLinks(data).map(link => link.id), ['first', 'also-first', 'secondary']);
  assert.equal(data.links[0].id, 'secondary');
});

test('malformed content, duplicate IDs, and non-boolean confirmations are rejected', () => {
  assert.ok(validateCatalog(null).errors.length);
  assert.ok(validateCatalog({ name: 'A', intro: '', links: 'no' }).errors.length);
  const data = make({ confirmed: 'true' });
  data.links.push({ ...data.links[0] });
  const errors = validateCatalog(data).errors.join(' ');
  assert.match(errors, /unique/);
  assert.match(errors, /true or false/);
});
