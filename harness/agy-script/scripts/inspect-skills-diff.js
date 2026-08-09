const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const items = JSON.parse(fs.readFileSync(`${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`, 'utf8'));
const currentSkills = fs.readdirSync(`${REPO_ROOT}/.agents/skills`);

console.log('ecc-items skills count:', items.skills.length);
console.log('current skills count:', currentSkills.length);

const missing = items.skills.filter(s => !currentSkills.includes(s));
console.log('Missing skills:', missing);
