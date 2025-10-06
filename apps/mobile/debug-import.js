// Debug import test
try {
  console.log('Testing IncomingCallScreen import...');
  const IncomingCallScreen = require('./src/screens/calling/IncomingCallScreen.tsx');
  console.log('Import successful:', typeof IncomingCallScreen);
  console.log('Default export:', typeof IncomingCallScreen.default);
} catch (error) {
  console.error('Import failed:', error.message);
}
