describe('Test Environment Setup', () => {
  test('should have correct test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 