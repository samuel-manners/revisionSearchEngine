const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sam141.brighton.domains',
  user: 'sam141_recycleDroid',
  password: '16]iyTWP=XQJ',
  database: 'sam141_recyclingDatabase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connect() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the MySQL database');
    return connection;
  } catch (error) {
    console.error('Error connecting to the MySQL database', error);
    throw error;
  }
}

module.exports = { connect };
