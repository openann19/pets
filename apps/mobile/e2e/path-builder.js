/**
 * Detox Path Builder for Artifacts
 * Custom path builder for organizing test artifacts
 */

const path = require('path');
const fs = require('fs');

module.exports = {
  buildPathForTestArtifact: (artifactName, testSummary) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = testSummary.title.replace(/[^a-zA-Z0-9]/g, '_');
    const suiteName = testSummary.suiteName.replace(/[^a-zA-Z0-9]/g, '_');
    
    const artifactDir = path.join(
      process.cwd(),
      'e2e',
      'artifacts',
      suiteName,
      testName,
      timestamp
    );

    // Ensure directory exists
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    return path.join(artifactDir, artifactName);
  }
};
