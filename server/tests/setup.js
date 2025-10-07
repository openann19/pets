// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.PORT = 5002;

jest.mock('../src/services/cloudinaryService');
