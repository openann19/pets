/**
 * Pact Contract Testing Configuration
 * Ensures API contracts between frontend and backend are maintained
 */
const { Pact } = require('@pact-foundation/pact');
const path = require('path');

const provider = new Pact({
  consumer: 'PawfectMatch-Web',
  provider: 'PawfectMatch-API',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  pactfileWriteMode: 'update',
  logLevel: 'INFO',
});

module.exports = provider;
