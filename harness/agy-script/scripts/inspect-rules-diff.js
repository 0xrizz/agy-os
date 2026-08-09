const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const items = JSON.parse(fs.readFileSync(`${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`, 'utf8'));
const rulesDir = `${REPO_ROOT}/.agents/rules`;
const currentRules = fs.readdirSync(rulesDir);

console.log('ecc-items rules count:', items.rules.length);
console.log('current rules count:', currentRules.length);

const missing = items.rules.filter(r => !currentRules.includes(`${r}.md`));
console.log('Missing rules:', missing);
