const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const connect = async () => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

const close = async () => {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

const isConnected = () => {
    return pool.totalCount > 0;
};

module.exports = {
    pool,
    connect,
    close,
    isConnected
};