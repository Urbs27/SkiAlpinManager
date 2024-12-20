module.exports = async () => {
  process.env.NODE_ENV = 'test';
  // Globales Setup vor allen Tests
  console.log('Starting tests...');
}; 