const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');

// 1. Read ecc-components-fix.txt
const fixText = fs.readFileSync(`${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-components-fix.txt`, 'utf8');

function parseFixText(content) {
  const sections = {};
  let currentSection = null;
  let currentDirective = null;

  const lines = content.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith('# ')) {
      currentSection = line.substring(2).trim().replace(':', '').toLowerCase();
      sections[currentSection] = { ADD: [], DELETE: [], EDIT: [] };
      currentDirective = null;
    } else if (line.startsWith('## ')) {
      const dir = line.substring(3).trim().replace(':', '');
      currentDirective = dir;
    } else if (line.startsWith('DELETE:')) {
      currentDirective = 'DELETE';
    } else if (line.startsWith('EDIT:')) {
      currentDirective = 'EDIT';
    } else if (line.startsWith('ADD:')) {
      currentDirective = 'ADD';
    } else if (line.startsWith('- ')) {
      const item = line.substring(2).trim();
      if (currentSection && currentDirective) {
        sections[currentSection][currentDirective].push(item);
      }
    }
  }
  return sections;
}

const fixManifest = parseFixText(fixText);

// 2. Physical Disk Inventory
const diskInventory = {
  agents: fs.readdirSync(`${REPO_ROOT}/.agents/plugin/ecc/agents`, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name),
  workflows: fs.readdirSync(`${REPO_ROOT}/.agents/workflows`, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md')).map(d => d.name),
  rules: fs.readdirSync(`${REPO_ROOT}/.agents/rules`, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md')).map(d => d.name.replace(/\.md$/, '')),
  skills: fs.readdirSync(`${REPO_ROOT}/.agents/skills`, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name)
};

// 3. Read target baseline ecc-items.json
const itemsJsonPath = `${REPO_ROOT}/docs/OBJ-06/artifacts/ecc-items.json`;
const targetBaseline = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));

console.log('===============================================================');
console.log('      OBJ-06 TASK 1 — AUDIT & COMPONENT DELTA REPORT');
console.log('===============================================================\n');

console.log('--- 1. MANIFEST DIRECTIVES FROM ecc-components-fix.txt ---');
console.log(`- Agents DELETE directives (${fixManifest.agents.DELETE.length}):`, fixManifest.agents.DELETE.map(i=>path.basename(i.replace(/\\/g, '/'))));
console.log(`- Workflows EDIT directives (${fixManifest.workflows.EDIT.length}):`, fixManifest.workflows.EDIT);
console.log(`- Workflows DELETE directives (${fixManifest.workflows.DELETE.length}):`, fixManifest.workflows.DELETE.map(i=>path.basename(i.replace(/\\/g, '/').split(' ')[0])));
console.log(`- Rules ADD directives (${fixManifest.rules.ADD.length}):`, fixManifest.rules.ADD);
console.log(`- Skills ADD directives (${fixManifest.skills.ADD.length}):`, fixManifest.skills.ADD);
console.log(`- Skills DELETE directives (${fixManifest.skills.DELETE.length}):`, fixManifest.skills.DELETE.map(i=>path.basename(i.replace(/\\/g, '/').split(' ')[0])));

console.log('\n--- 2. PHYSICAL DISK PRE-REFACTOR ENUMERATION ---');
console.log(`- Installed Agents (.agents/plugin/ecc/agents/): ${diskInventory.agents.length} subdirectories`);
console.log(`- Installed Workflows (.agents/workflows/): ${diskInventory.workflows.length} files (Bridge a-*.md: ${diskInventory.workflows.filter(w=>w.startsWith('a-')).length}, Normal: ${diskInventory.workflows.filter(w=>!w.startsWith('a-')).length})`);
console.log(`- Installed Rules (.agents/rules/): ${diskInventory.rules.length} files`);
console.log(`- Installed Skills (.agents/skills/): ${diskInventory.skills.length} subdirectories`);

console.log('\n--- 3. DELTA CATEGORIZATION REPORT ---');

// Categorize Agents
const agentDeletes = fixManifest.agents.DELETE.map(i=>path.basename(i.replace(/\\/g, '/')));
const agentReport = diskInventory.agents.map(a => {
  if (agentDeletes.includes(a)) {
    return { name: a, action: 'DELETE', status: 'Present on disk, listed for removal' };
  }
  return { name: a, action: 'NO CHANGE (RELOCATE)', status: 'Present on disk, to be relocated to .agents/agents/' };
});

// Categorize Workflows
const wfDeletes = fixManifest.workflows.DELETE.map(i=>path.basename(i.replace(/\\/g, '/').split(' ')[0]));
const wfEdits = ['update-codemaps.md', 'plan-prd.md'];
const wfReport = diskInventory.workflows.map(w => {
  if (w.startsWith('a-')) {
    return { name: w, action: 'DELETE (BRIDGE)', status: 'Bridge workflow to be removed for registry purity' };
  } else if (wfDeletes.includes(w)) {
    return { name: w, action: 'DELETE (MANIFEST)', status: 'Present on disk, listed for removal' };
  } else if (wfEdits.includes(w)) {
    return { name: w, action: 'EDIT', status: 'Present on disk, target path reference update' };
  }
  return { name: w, action: 'NO CHANGE', status: 'Retained command workflow' };
});

// Categorize Rules
const ruleAdds = fixManifest.rules.ADD.map(r => r.replace(/\.md$/, ''));
const ruleReport = [];
diskInventory.rules.forEach(r => {
  ruleReport.push({ name: r, action: 'NO CHANGE', status: 'Retained rule' });
});
ruleAdds.forEach(r => {
  if (!diskInventory.rules.includes(r)) {
    ruleReport.push({ name: r, action: 'ADD', status: 'Absent on disk, declared new in manifest' });
  }
});

// Categorize Skills
const skillDeletes = fixManifest.skills.DELETE.map(i=>path.basename(i.replace(/\\/g, '/').split(' ')[0]));
const skillAdds = fixManifest.skills.ADD;
const skillReport = [];
diskInventory.skills.forEach(s => {
  if (skillDeletes.includes(s)) {
    skillReport.push({ name: s, action: 'DELETE', status: 'Present on disk, listed for removal' });
  } else {
    skillReport.push({ name: s, action: 'NO CHANGE', status: 'Retained skill' });
  }
});
skillAdds.forEach(s => {
  if (!diskInventory.skills.includes(s)) {
    skillReport.push({ name: s, action: 'ADD', status: 'Absent on disk, declared new in manifest' });
  }
});

console.log(`Agents Summary: Total on Disk = ${diskInventory.agents.length}, DELETE = ${agentReport.filter(a=>a.action==='DELETE').length}, RELOCATE = ${agentReport.filter(a=>a.action.includes('RELOCATE')).length}`);
console.log(`Workflows Summary: Total on Disk = ${diskInventory.workflows.length}, DELETE Bridge (a-*.md) = ${wfReport.filter(w=>w.action.includes('BRIDGE')).length}, DELETE Manifest = ${wfReport.filter(w=>w.action==='DELETE (MANIFEST)').length}, EDIT = ${wfReport.filter(w=>w.action==='EDIT').length}, RETAINED = ${wfReport.filter(w=>w.action==='NO CHANGE').length}`);
console.log(`Rules Summary: Current Disk = ${diskInventory.rules.length}, ADD = ${ruleReport.filter(r=>r.action==='ADD').length}, RETAINED = ${ruleReport.filter(r=>r.action==='NO CHANGE').length}, TOTAL POST-OBJ06 = ${ruleReport.length}`);
console.log(`Skills Summary: Current Disk = ${diskInventory.skills.length}, DELETE = ${skillReport.filter(s=>s.action==='DELETE').length}, ADD = ${skillReport.filter(s=>s.action==='ADD').length}, RETAINED = ${skillReport.filter(s=>s.action==='NO CHANGE').length}, TOTAL POST-OBJ06 = ${skillReport.filter(s=>s.action!=='DELETE').length}`);

console.log('\n--- 4. TARGET BASELINE VERIFICATION AGAINST ecc-items.json ---');
console.log(`- Rules target: ${targetBaseline.rules.length} (Expected: 33) -> ${targetBaseline.rules.length === 33 ? 'MATCH' : 'DISCREPANCY'}`);
console.log(`- Agents target: ${targetBaseline.agents.length} (Expected: 31 or 28? Note: 28 subagents in ecc-items.json + 3 GAN subagents = 31 subagents total in proposal matrix)`);
console.log(`- Commands target: ${targetBaseline.commands.length} (Expected: 32 commands in task.md)`);
console.log(`- Hooks target: ${targetBaseline.hooks.length} (Expected: 1) -> ${targetBaseline.hooks.length === 1 ? 'MATCH' : 'DISCREPANCY'}`);
console.log(`- Skills target: ${targetBaseline.skills.length} (Expected: 42) -> ${targetBaseline.skills.length === 42 ? 'MATCH' : 'DISCREPANCY'}`);
console.log(`- Platform target: ${targetBaseline.platform.length} (Expected: 3) -> ${targetBaseline.platform.length === 3 ? 'MATCH' : 'DISCREPANCY'}`);

console.log('\n===============================================================');
