const fs = require('fs');
const path = require('path');

function findFile(dir, filename) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findFile(full, filename);
    } else if (f.name === filename) {
      console.log('Found:', full);
    }
  }
}

findFile('d:/dev/agy-os', 'cloudflare-edge-runtime.md');
findFile('d:/dev/agy-os', 'monorepo-workspace.md');
