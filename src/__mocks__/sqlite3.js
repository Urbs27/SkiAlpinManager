const mockDb = {
    all: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        let result = [];
        if (sql.includes('SELECT 1')) {
            result = [{ test: 1 }];
        } else if (sql.includes('sqlite_master')) {
            result = [{ name: 'users' }];
        }
        
        callback(null, result);
    },

    run: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        callback.call({ lastID: 1, changes: 1 }, null);
    },

    exec: function(sql, callback) {
        callback(null);
    },

    close: function(callback) {
        callback(null);
    }
};

class Database {
    constructor(path, callback) {
        Object.assign(this, mockDb);
        if (callback) {
            callback(null);
        }
    }
}

module.exports = {
    verbose: () => ({
        Database
    })
}; 