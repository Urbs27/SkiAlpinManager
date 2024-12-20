module.exports = function(session) {
  return class MockSQLiteStore {
    constructor(options) {
      this.options = options || {};
    }
    on(event, callback) {
      // Mock die on-Methode, die von express-session erwartet wird
    }
  };
}; 