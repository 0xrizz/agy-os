function readPackage(pkg, context) {
  if (pkg.dependencies && pkg.dependencies['fast-uri']) {
    pkg.dependencies['fast-uri'] = '^3.1.5';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
