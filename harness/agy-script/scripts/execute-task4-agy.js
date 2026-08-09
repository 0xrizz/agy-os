const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
const workflowsDir = `${REPO_ROOT}/.agents/workflows`;
const skillsDir = `${REPO_ROOT}/.agents/skills`;

console.log('=== Executing Task 4: Component Pruning & Bridge Workflow Cleanup ===\n');

// 1. Delete all a-*.md bridge workflows from .agents/workflows/
const workflowFiles = fs.readdirSync(workflowsDir);
let deletedBridgeCount = 0;
for (const file of workflowFiles) {
  if (file.startsWith('a-') && file.endsWith('.md')) {
    const filePath = `${workflowsDir}/${file}`;
    fs.unlinkSync(filePath);
    console.log(`✓ [DELETED BRIDGE WORKFLOW] ${file}`);
    deletedBridgeCount++;
  }
}
console.log(`\nSub-task 4.1 complete: Deleted ${deletedBridgeCount} bridge workflows (a-*.md).\n`);

// 2. Delete 27 obsolete workflow files
const obsoleteWorkflows = [
  'cost-report.md',
  'ecc-guide.md',
  'epic-claim.md',
  'epic-decompose.md',
  'epic-publish.md',
  'epic-review.md',
  'epic-sync.md',
  'epic-unblock.md',
  'epic-validate.md',
  'evolve.md',
  'learn-eval.md',
  'learn.md',
  'multi-backend.md',
  'multi-execute.md',
  'multi-frontend.md',
  'multi-plan.md',
  'multi-workflow.md',
  'orch-add-feature.md',
  'orch-build-mvp.md',
  'orch-change-feature.md',
  'orch-fix-defect.md',
  'orch-refine-code.md',
  'orch-review.md',
  'plan-canvas.md',
  'promote.md',
  'skill-create.md',
  'skill-health.md'
];

let deletedObsoleteWorkflowsCount = 0;
for (const wf of obsoleteWorkflows) {
  const filePath = `${workflowsDir}/${wf}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ [DELETED OBSOLETE WORKFLOW] ${wf}`);
    deletedObsoleteWorkflowsCount++;
  } else {
    console.log(`  [ALREADY DELETED] ${wf}`);
  }
}
console.log(`\nSub-task 4.2 complete: Deleted ${deletedObsoleteWorkflowsCount} obsolete workflows.\n`);

// 3. Update update-codemaps.md and plan-prd.md
const updateCodemapsPath = `${workflowsDir}/update-codemaps.md`;
if (fs.existsSync(updateCodemapsPath)) {
  let content = fs.readFileSync(updateCodemapsPath, 'utf8');
  content = content.replace(/CODEMAPS\//g, 'docs/system/architecture/codemaps/');
  fs.writeFileSync(updateCodemapsPath, content, 'utf8');
  console.log(`✓ [EDITED WORKFLOW] update-codemaps.md -> docs/system/architecture/codemaps/`);
}

const planPrdPath = `${workflowsDir}/plan-prd.md`;
if (fs.existsSync(planPrdPath)) {
  let content = fs.readFileSync(planPrdPath, 'utf8');
  content = content.replace(/PRD\.md/g, 'docs/strategy/prd.md');
  fs.writeFileSync(planPrdPath, content, 'utf8');
  console.log(`✓ [EDITED WORKFLOW] plan-prd.md -> docs/strategy/prd.md`);
}
console.log(`\nSub-task 4.3 complete: Updated workflow edit targets.\n`);

// 4. Delete 17 obsolete skill directories
const obsoleteSkills = [
  'api-connector-builder',
  'automation-audit-ops',
  'autonomous-agent-harness',
  'autonomous-loops',
  'connections-optimizer',
  'content-hash-cache-pattern',
  'continuous-agent-loop',
  'email-ops',
  'knowledge-ops',
  'latency-critical-systems',
  'orch-add-feature',
  'orch-build-mvp',
  'orch-change-feature',
  'orch-fix-defect',
  'orch-pipeline',
  'orch-refine-code',
  'parallel-execution-optimizer'
];

let deletedSkillsCount = 0;
for (const skillName of obsoleteSkills) {
  const skillPath = `${skillsDir}/${skillName}`;
  if (fs.existsSync(skillPath)) {
    fs.rmSync(skillPath, { recursive: true, force: true });
    console.log(`✓ [DELETED OBSOLETE SKILL] ${skillName}`);
    deletedSkillsCount++;
  } else {
    console.log(`  [ALREADY DELETED SKILL] ${skillName}`);
  }
}
console.log(`\nSub-task 4.4 complete: Deleted ${deletedSkillsCount} obsolete skill directories.\n`);

// 5. Audit .agents/scripts/
const scriptsDir = `${REPO_ROOT}/.agents/scripts`;
if (fs.existsSync(scriptsDir)) {
  console.log('Auditing .agents/scripts/...');
  const scripts = fs.readdirSync(scriptsDir);
  console.log(`Scripts found in .agents/scripts/: ${scripts.join(', ')}`);
}

console.log('\n=== Task 4 Execution Completed Successfully ===');
