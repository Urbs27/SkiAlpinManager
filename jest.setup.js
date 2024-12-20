jest.setTimeout(60000);

afterEach(async () => {
  jest.clearAllMocks();
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Test-Setup
process.env.NODE_ENV = 'test'; 