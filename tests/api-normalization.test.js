const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const apiSource = fs.readFileSync(path.join(__dirname, '..', 'api', 'index.js'), 'utf8');
const start = apiSource.indexOf('function normalizeText');
assert.notStrictEqual(start, -1, 'normalizeText helper not found');

const openBrace = apiSource.indexOf('{', start);
let depth = 0;
let end = -1;
for (let i = openBrace; i < apiSource.length; i += 1) {
  const char = apiSource[i];
  if (char === '{') depth += 1;
  if (char === '}') {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
assert.notStrictEqual(end, -1, 'normalizeText helper block not parsed');

const normalizeTextSource = apiSource.slice(start, end);
const sandbox = { console, String, RegExp };
vm.createContext(sandbox);
vm.runInContext(`${normalizeTextSource}\n`, sandbox);

assert.strictEqual(sandbox.normalizeText('New York'), 'new york');
assert.strictEqual(sandbox.normalizeText('new-york'), 'new york');
assert.strictEqual(sandbox.normalizeText('San Antonio'), 'san antonio');
assert.strictEqual(sandbox.normalizeText('  Los Angeles  '), 'los angeles');

console.log('API city normalization test passed');
