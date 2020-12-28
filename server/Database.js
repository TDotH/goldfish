const { Pool } = require('pg');

//URI from Heroku, not permanent since Heroku rotates the credentials every once in a awhile
const connectionString = process.env.DATABASE_URL || "postgres://ethczpetqidjzl:8b637f0027709d68f9e7e9f8ba33790846f9189a5feedc178d0d65fe44e2d5b2@ec2-3-218-123-191.compute-1.amazonaws.com:5432/d9kup0joljq3ru";

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
