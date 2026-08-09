const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const eccSkillsDir = `${REPO_ROOT}/ECC/skills`;
const targetSkillsDir = `${REPO_ROOT}/.agents/skills`;

const missingSkills = [
  'nextjs-turbopack',
  'tdd-workflow',
  'verification-loop',
  'e2e-testing',
  'error-handling',
  'api-design',
  'frontend-patterns',
  'accessibility',
  'git-workflow',
  'motion-advanced',
  'motion-foundations',
  'motion-patterns',
  'frontend-design-direction',
  'frontend-a11y'
];

console.log('=== Copying 14 missing ECC skills to .agents/skills/ ===\n');

for (const skillName of missingSkills) {
  const src = `${eccSkillsDir}/${skillName}`;
  const dest = `${targetSkillsDir}/${skillName}`;

  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ [COPIED SKILL] ${skillName} -> .agents/skills/${skillName}`);
  } else {
    console.error(`✗ [NOT FOUND IN ECC] ${src}`);
  }
}

console.log('\nSync complete!');
