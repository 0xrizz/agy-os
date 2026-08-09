const path = require('path');

let helpers;
try {
  helpers = require('../../ECC/scripts/lib/install-targets/helpers');
} catch (e) {
  helpers = require('../../../ECC/scripts/lib/install-targets/helpers');
}

const {
  createFlatRuleOperations,
  createInstallTargetAdapter,
  createManagedScaffoldOperation,
  normalizeRelativePath,
} = helpers;

const SUPPORTED_SOURCE_PREFIXES = ['rules', 'commands', 'agents', 'hooks', 'platform', 'skills'];

function toForwardSlashes(p) {
  return String(p || '').replace(/\\/g, '/');
}

function ensureForwardSlashes(op) {
  if (!op) return op;
  const cleaned = { ...op };
  if (cleaned.sourceRelativePath) {
    cleaned.sourceRelativePath = toForwardSlashes(cleaned.sourceRelativePath);
  }
  if (cleaned.destinationPath) {
    cleaned.destinationPath = toForwardSlashes(cleaned.destinationPath);
  }
  return cleaned;
}

function supportsAntigravitySourcePath(sourceRelativePath) {
  const normalizedPath = normalizeRelativePath(sourceRelativePath);
  return SUPPORTED_SOURCE_PREFIXES.some(prefix => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}

module.exports = createInstallTargetAdapter({
  id: 'antigravity-project-agy',
  target: 'antigravity',
  kind: 'project',
  rootSegments: ['.agents', 'plugin', 'ecc'],
  installStatePathSegments: ['ecc-install-state.json'],
  supportsModule(module) {
    const paths = Array.isArray(module && module.paths) ? module.paths : [];
    return paths.some(supportsAntigravitySourcePath);
  },
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules)
      ? input.modules
      : (input.module ? [input.module] : []);
    const {
      repoRoot,
      projectRoot,
      homeDir,
    } = input;
    const baseRoot = toForwardSlashes(projectRoot || repoRoot);
    const planningInput = {
      repoRoot: baseRoot,
      projectRoot: baseRoot,
      homeDir: homeDir ? toForwardSlashes(homeDir) : homeDir,
    };
    const targetRoot = toForwardSlashes(adapter.resolveRoot(planningInput));

    return modules.flatMap(module => {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      return paths
        .filter(supportsAntigravitySourcePath)
        .flatMap(sourceRelativePath => {
          const normalizedPath = normalizeRelativePath(sourceRelativePath);

          if (normalizedPath === 'rules' || normalizedPath.startsWith('rules/')) {
            const ruleOps = createFlatRuleOperations({
              moduleId: module.id,
              repoRoot: baseRoot,
              sourceRelativePath,
              destinationDir: toForwardSlashes(path.join(baseRoot, '.agents', 'rules')),
            });
            return ruleOps.map(ensureForwardSlashes);
          }

          let destPath;
          if (normalizedPath === 'commands') {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'workflows'));
          } else if (normalizedPath.startsWith('commands/')) {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'workflows', normalizedPath.slice('commands/'.length)));
          } else if (normalizedPath === 'agents') {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'agents'));
          } else if (normalizedPath.startsWith('agents/')) {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'agents', normalizedPath.slice('agents/'.length)));
          } else if (normalizedPath === 'hooks') {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'hooks.json'));
          } else if (normalizedPath.startsWith('hooks/')) {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'hooks.json'));
          } else if (normalizedPath === 'platform') {
            destPath = toForwardSlashes(path.join(targetRoot, 'platform'));
          } else if (normalizedPath.startsWith('platform/')) {
            destPath = toForwardSlashes(path.join(targetRoot, 'platform', normalizedPath.slice('platform/'.length)));
          } else if (normalizedPath === 'skills') {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'skills'));
          } else if (normalizedPath.startsWith('skills/')) {
            destPath = toForwardSlashes(path.join(baseRoot, '.agents', 'skills', normalizedPath.slice('skills/'.length)));
          }

          if (destPath) {
            return [
              ensureForwardSlashes(
                createManagedScaffoldOperation(
                  module.id,
                  sourceRelativePath,
                  destPath,
                  'preserve-relative-path'
                )
              ),
            ];
          }

          return [ensureForwardSlashes(adapter.createScaffoldOperation(module.id, sourceRelativePath, planningInput))];
        });
    });
  },
});
