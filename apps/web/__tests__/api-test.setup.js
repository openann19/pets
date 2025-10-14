/**
 * Setup file for API tests
 */

// Setup the fetch polyfill
import 'whatwg-fetch';

// Define a global base URL for tests
globalThis.BASE_URL = 'http://localhost:3000';

// Setup server mocks
import { server } from './api/mocks/handlers';

// Import API helpers
import './api/helpers';

// Enable API mocking in all tests
beforeAll(() => server.listen());

// Reset request handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());