const path = require('path');

module.exports = {
  projects: [
    path.join(__dirname, 'apps/web'),
    path.join(__dirname, 'apps/mobile'),
    path.join(__dirname, 'packages/core'),
    path.join(__dirname, 'packages/ui')
  ].filter(projectPath => {
    try {
      require.resolve(path.join(projectPath, 'jest.config.js'));
      return true;
    } catch {
      return false;
    }
  }).map(projectPath => ({
    ...require(path.join(projectPath, 'jest.config.js')),
    rootDir: projectPath,
    displayName: path.basename(projectPath)
  }))
};
