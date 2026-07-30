/**
 * Antigravity Rules Frontmatter Formatter Script & Utility
 *
 * Enforces standard YAML frontmatters across .agents/rules/*.md files:
 * - common-*.md -> trigger: always_on
 * - typescript-*.md & react-*.md -> trigger: glob
 * - web-*.md -> trigger: model_decision
 */

const fs = require('fs');
const path = require('path');

const RULE_FRONTMATTER_CONFIG = {
  // Group 1: Baseline rules
  'common-agents': { trigger: 'always_on' },
  'common-development-workflow': { trigger: 'always_on' },
  'common-performance': { trigger: 'always_on' },
  'common-code-review': {
    trigger: 'model_decision',
    description: 'Code review standards, review checklists, mandatory triggers, review severity levels, and code review workflows'
  },
  'common-coding-style': {
    trigger: 'model_decision',
    description: 'Coding style standards, immutability rules, KISS/DRY/YAGNI principles, file organization, error handling, naming conventions, and code smells to avoid'
  },
  'common-git-workflow': {
    trigger: 'model_decision',
    description: 'Git workflow rules, conventional commit message formats, PR workflows, and git branch standards'
  },
  'common-hooks': {
    trigger: 'model_decision',
    description: 'Hooks system rules, PreToolUse/PostToolUse/Stop hooks, auto-accept permissions, and TodoWrite best practices'
  },
  'common-patterns': {
    trigger: 'model_decision',
    description: 'Common architecture patterns, skeleton projects, repository pattern, and API response format standards'
  },
  'common-security': {
    trigger: 'model_decision',
    description: 'Security guidelines, mandatory security checks before commit, secret management, and security response protocols'
  },
  'common-testing': {
    trigger: 'model_decision',
    description: 'Testing requirements, 80% coverage threshold, TDD workflow, test structure AAA pattern, and test naming conventions'
  },

  // Group 2: TypeScript rules -> glob
  'typescript-coding-style': { trigger: 'glob', globs: '**/*.{ts,tsx,js,jsx}' },
  'typescript-hooks': { trigger: 'glob', globs: '**/*.{ts,tsx}' },
  'typescript-patterns': { trigger: 'glob', globs: '**/*.{ts,tsx}' },
  'typescript-security': { trigger: 'glob', globs: '**/*.{ts,tsx}' },
  'typescript-testing': { trigger: 'glob', globs: '**/*.{test,spec}.{ts,tsx}' },

  // Group 3: React rules -> glob
  'react-coding-style': {
    trigger: 'glob',
    globs: '**/*.{tsx,jsx}, **/components/**/*.{ts,js}, **/hooks/**/*.{ts,js}'
  },
  'react-hooks': {
    trigger: 'glob',
    globs: '**/*.{tsx,jsx}, **/hooks/**/*.{ts,js}'
  },
  'react-patterns': {
    trigger: 'glob',
    globs: '**/*.{tsx,jsx}, **/components/**/*.{ts,js}'
  },
  'react-security': {
    trigger: 'glob',
    globs: '**/*.{tsx,jsx}'
  },
  'react-testing': {
    trigger: 'glob',
    globs: '**/*.{test,spec}.{tsx,jsx}'
  },

  // Group 4: Web rules -> model_decision
  'web-coding-style': {
    trigger: 'model_decision',
    description: 'Web frontend coding style guidelines, HTML5 semantic markup standards, CSS file organization, component structure, asset placement, and web code formatting'
  },
  'web-design-quality': {
    trigger: 'model_decision',
    description: 'Web design quality, visual aesthetics, UI layout consistency, responsive typography, spacing systems, micro-interactions, anti-template standards, and visual polish guidelines'
  },
  'web-hooks': {
    trigger: 'model_decision',
    description: 'Frontend web hooks, browser event lifecycle management, DOM event listeners, ResizeObserver, IntersectionObserver, scroll handlers, and web tool execution patterns'
  },
  'web-patterns': {
    trigger: 'model_decision',
    description: 'Common web frontend design patterns, compound component composition, state hydration, UI layout patterns, render delegation, and web architecture'
  },
  'web-performance': {
    trigger: 'model_decision',
    description: 'Web frontend performance optimization, Core Web Vitals (LCP, INP, CLS, FCP), bundle size reduction, code splitting, asset preloading, lazy loading, and rendering speed'
  },
  'web-security': {
    trigger: 'model_decision',
    description: 'Web application security best practices, Content Security Policy (CSP), XSS prevention, client-side input sanitization, CORS header configuration, and secure storage'
  },
  'web-testing': {
    trigger: 'model_decision',
    description: 'Web frontend testing standards, DOM Testing Library patterns, visual regression testing, E2E browser check flows, and multi-breakpoint UI validation'
  }
};

function stripExistingFrontmatter(content) {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('---')) {
    const endIdx = trimmed.indexOf('---', 3);
    if (endIdx !== -1) {
      return trimmed.slice(endIdx + 3).trimStart();
    }
  }
  return content;
}

function generateFrontmatterHeader(config) {
  if (!config) return '';
  let yaml = `---\ntrigger: ${config.trigger}\n`;
  const globsVal = config.globs || config.glob;
  if (globsVal) {
    const singleLineGlob = Array.isArray(globsVal) ? globsVal.join(', ') : globsVal;
    yaml += `globs: "${singleLineGlob}"\n`;
  }
  if (config.description) {
    yaml += `description: ${config.description}\n`;
  }
  yaml += `---\n\n`;
  return yaml;
}

function formatRuleContent(ruleName, rawContent) {
  const config = RULE_FRONTMATTER_CONFIG[ruleName];
  const body = stripExistingFrontmatter(rawContent);
  if (!config) {
    // Default fallback to always_on if unknown rule
    return `---\ntrigger: always_on\n---\n\n${body}`;
  }
  const header = generateFrontmatterHeader(config);
  return `${header}${body}`;
}

function updateAllTargetRules(rulesDir) {
  if (!fs.existsSync(rulesDir)) {
    console.error(`[Frontmatter Engine] Error: Directory not found at ${rulesDir}`);
    return 0;
  }

  const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
  let updatedCount = 0;

  for (const file of files) {
    const ruleName = file.slice(0, -3);
    const filePath = path.join(rulesDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const formatted = formatRuleContent(ruleName, raw);
    fs.writeFileSync(filePath, formatted, 'utf8');
    updatedCount++;
    console.log(`[Frontmatter Engine] Formatted header for .agents/rules/${file} (${RULE_FRONTMATTER_CONFIG[ruleName]?.trigger || 'always_on'})`);
  }

  return updatedCount;
}

if (require.main === module) {
  const repoRoot = path.resolve(__dirname, '../../..').replace(/\\/g, '/');
  const targetDirs = [
    `${repoRoot}/.agents/rules`,
    `${repoRoot}/frameworks/openspec/.agents/rules`
  ];

  if (process.argv[2]) {
    targetDirs.push(path.resolve(process.argv[2]).replace(/\\/g, '/'));
  }

  for (const targetDir of targetDirs) {
    if (fs.existsSync(targetDir)) {
      console.log(`[Frontmatter Engine] Updating rule frontmatters in ${targetDir}...`);
      const count = updateAllTargetRules(targetDir);
      console.log(`[Frontmatter Engine] Successfully updated ${count} rule files in ${targetDir}.`);
    }
  }
}

module.exports = {
  RULE_FRONTMATTER_CONFIG,
  stripExistingFrontmatter,
  generateFrontmatterHeader,
  formatRuleContent,
  updateAllTargetRules
};
