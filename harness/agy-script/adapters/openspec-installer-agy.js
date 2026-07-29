/**
 * ECC Installer Adapter for OpenSpec Repository (frameworks/openspec)
 * 
 * Copies installed ECC assets (.agents/) from agy-os workspace root
 * to frameworks/openspec/.agents/, ensuring isolation and governance.
 */

const fs = require('fs');
const path = require('path');

const srcAgentsDir = path.resolve(__dirname, '../../../.agents').replace(/\\/g, '/');
const destAgentsDir = path.resolve(__dirname, '../../../frameworks/openspec/.agents').replace(/\\/g, '/');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    ensureDirSync(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry).replace(/\\/g, '/');
      const destPath = path.join(dest, entry).replace(/\\/g, '/');
      copyRecursiveSync(srcPath, destPath);
    }
  } else if (exists && stats.isFile()) {
    ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

console.log('[OpenSpec ECC Installer] Starting ECC installation for frameworks/openspec...');
console.log(`Source: ${srcAgentsDir}`);
console.log(`Destination: ${destAgentsDir}`);

if (!fs.existsSync(srcAgentsDir)) {
  console.error(`Error: Source .agents directory not found at ${srcAgentsDir}`);
  process.exit(1);
}

copyRecursiveSync(srcAgentsDir, destAgentsDir);
console.log('[OpenSpec ECC Installer] SUCCESS: ECC assets successfully installed into frameworks/openspec/.agents/');
