const { Pool } = require('pg');

//URI from Heroku, not permanent since Heroku rotates the credentials every once in a awhile
const connectionString = process.env.DATABASE_URL;
const query = 'SELECT * FROM "Tasks"';

//Pg pools keep the connection "hot" to reuse client requests 
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const pullTable = async() => {
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch(err) {
        throw err;
    }
};

//Closes the connection to the db
const closeDB = async() => {
    try {
        await pool.end();
        return;
    } catch(err) {
        throw err;
    }
};

exports.pullTable = pullTable;
exports.closeDB = closeDB;
