// Test import
try {
  console.log('Testing import...');
  const component = require('./src/screens/calling/IncomingCallScreen.tsx');
  console.log('Import result:', typeof component);
  console.log('Default export:', typeof component.default);
  console.log('Component:', component.default);
} catch (error) {
  console.error('Import failed:', error.message);
  console.error('Stack:', error.stack);
}
