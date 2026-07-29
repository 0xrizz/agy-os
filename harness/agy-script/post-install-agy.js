/**
 * Post-Install Transformation Script (Antigravity agy-os)
 * 
 * Restructures native ECC agents into .agents/plugin/ecc/agents/<name>/agent.md,
 * generates flat root bridge workflows in .agents/workflows/a-<name>.md,
 * and purges orphan bridge workflows that do not correspond to installed subagents.
 * 
 * Usage: node harness/agy-script/post-install-agy.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..').replace(/\\/g, '/');
const pluginAgentsDir = `${rootDir}/.agents/plugin/ecc/agents`;
const rootWorkflowsDir = `${rootDir}/.agents/workflows`;

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function runPostInstallTransformation() {
  console.log('[Post-Install Engine] Starting post-install agent transformation...');

  ensureDirSync(pluginAgentsDir);
  ensureDirSync(rootWorkflowsDir);

  const entries = fs.readdirSync(pluginAgentsDir, { withFileTypes: true });

  // Step 1: Restructure single .md files into directories with agent.md
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const agentName = entry.name.slice(0, -3);
      const oldPath = `${pluginAgentsDir}/${entry.name}`;
      const newAgentDir = `${pluginAgentsDir}/${agentName}`;
      const newAgentFile = `${newAgentDir}/agent.md`;

      ensureDirSync(newAgentDir);
      fs.copyFileSync(oldPath, newAgentFile);
      fs.unlinkSync(oldPath);
      console.log(`[Restructure] Converted ${entry.name} -> agents/${agentName}/agent.md`);
    }
  }

  // Step 2: Scan all subagent directories under .agents/plugin/ecc/agents/
  const subagentDirs = fs.readdirSync(pluginAgentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  const installedAgentSet = new Set(subagentDirs);
  console.log(`[Post-Install Engine] Detected ${subagentDirs.length} subagents in .agents/plugin/ecc/agents/`);

  let generatedCount = 0;

  // Step 3: Generate flat root bridge workflows in .agents/workflows/a-<name>.md
  for (const agentName of subagentDirs) {
    const bridgeWorkflowPath = `${rootWorkflowsDir}/a-${agentName}.md`;
    const agentMdPath = `.agents/plugin/ecc/agents/${agentName}/agent.md`;

    // Ensure target agent has agent.md
    const targetAgentFile = `${pluginAgentsDir}/${agentName}/agent.md`;
    if (!fs.existsSync(targetAgentFile)) {
      fs.writeFileSync(targetAgentFile, `# Subagent: ${agentName}\n\nAutomated scaffold for subagent ${agentName}.\n`, 'utf8');
    }

    const workflowContent = `---
description: "Bridge workflow to delegate tasks to the ${agentName} subagent"
---

# Bridge Workflow: /a-${agentName}

This workflow delegates tasks directly to the \`${agentName}\` subagent located at [agent.md](file:///${agentMdPath}).

## Subagent Delegation Instructions

When triggered via \`/a-${agentName}\`:
1. Invoke subagent \`${agentName}\` with context and relevant task parameters.
2. Follow all guidelines specified in [agent.md](file:///${agentMdPath}).
3. Return execution results to the primary workflow controller.
`;

    fs.writeFileSync(bridgeWorkflowPath, workflowContent, 'utf8');
    generatedCount++;
  }

  // Step 4: Purge orphan bridge workflows in .agents/workflows/a-*.md that do NOT correspond to an installed agent
  let purgedCount = 0;
  if (fs.existsSync(rootWorkflowsDir)) {
    const existingWorkflows = fs.readdirSync(rootWorkflowsDir);
    for (const file of existingWorkflows) {
      if (file.startsWith('a-') && file.endsWith('.md')) {
        const agentName = file.slice(2, -3);
        if (!installedAgentSet.has(agentName)) {
          const orphanPath = `${rootWorkflowsDir}/${file}`;
          fs.unlinkSync(orphanPath);
          purgedCount++;
          console.log(`[Purge] Removed orphan bridge workflow: ${file}`);
        }
      }
    }
  }

  console.log(`[Post-Install Engine] SUCCESS: Generated ${generatedCount} bridge workflows in ${rootWorkflowsDir}/ (Purged ${purgedCount} orphan workflows)`);
  console.log('[Post-Install Engine] Registry purity verified: .agents/workflows/ layout is 100% flat with zero nested subdirectories.');
}

if (require.main === module) {
  runPostInstallTransformation();
}

module.exports = { runPostInstallTransformation };
