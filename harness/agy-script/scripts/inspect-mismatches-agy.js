const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const itemsConfig = JSON.parse(fs.readFileSync(`${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`, 'utf8'));

const kinds = ['rules', 'agents', 'commands', 'hooks', 'skills', 'platform'];

kinds.forEach(kind => {
  const declared = itemsConfig[kind] || [];
  declared.forEach(item => {
    let itemPath = '';
    let exists = false;
    if (kind === 'rules') {
      itemPath = `${REPO_ROOT}/.agents/rules/${item}.md`;
    } else if (kind === 'agents') {
      itemPath = `${REPO_ROOT}/.agents/agents/${item}/agent.md`;
    } else if (kind === 'commands') {
      itemPath = `${REPO_ROOT}/.agents/workflows/${item}.md`;
    } else if (kind === 'hooks') {
      itemPath = `${REPO_ROOT}/.agents/hooks.json`;
    } else if (kind === 'skills') {
      itemPath = `${REPO_ROOT}/.agents/skills/${item.replace(/\.md$/, '')}/SKILL.md`;
    } else if (kind === 'platform') {
      itemPath = `${REPO_ROOT}/.agents/plugin/ecc/platform/${item}`;
    }
    exists = fs.existsSync(itemPath);
    if (!exists) {
      console.log(`MISSING [${kind}]:`, item, '->', itemPath);
    }
  });
});

// Check extra commands
const declaredCmds = new Set(itemsConfig.commands.map(i => `${i}.md`));
const wfFiles = fs.readdirSync(`${REPO_ROOT}/.agents/workflows`).filter(f => f.endsWith('.md'));
wfFiles.forEach(f => {
  if (!declaredCmds.has(f)) {
    console.log('EXTRA [commands]:', f);
  }
});
