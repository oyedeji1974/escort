const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'ad.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf(`function ${name}`);
  assert.notStrictEqual(start, -1, `${name} function not found`);
  const openBrace = html.indexOf('{', start);
  let depth = 0;
  let i = openBrace;
  while (i < html.length) {
    const char = html[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start, i + 1);
      }
    }
    i += 1;
  }
  throw new Error(`Could not parse ${name}`);
}

const sandbox = { console, encodeURIComponent, URL };
vm.createContext(sandbox);
vm.runInContext(`${extractFunction('createPlaceholderImage')}
`, sandbox);
vm.runInContext(`${extractFunction('resolveImageSource')}
`, sandbox);

const result = sandbox.resolveImageSource('https://via.placeholder.com/400x300');
assert.strictEqual(result, 'https://via.placeholder.com/400x300');
assert.strictEqual(sandbox.resolveImageSource('/images/test.jpg'), '/images/test.jpg');
assert.strictEqual(sandbox.resolveImageSource('data:image/png;base64,abc123'), 'data:image/png;base64,abc123');
assert.ok(sandbox.resolveImageSource('').startsWith('data:image/svg+xml'));
assert.ok(result.startsWith('https://'));

console.log('resolveImageSource regression test passed');
