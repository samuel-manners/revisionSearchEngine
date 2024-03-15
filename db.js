const mysql = require('mysql2/promise');
const fs = require('fs');

const config =
{
  host: 're-vision-database-server.mysql.database.azure.com',
  user: 'vjzezpwkxd',
  password: 'Sh@dw3ll',
  database: 're-vision-database',
  port: 3306,
  ssl: { ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem") },
};

async function createConnection() {
  try {
    return mysql.createConnection(config);
  } catch (error) {
    console.error('Error connecting to the MySQL database', error);
    throw error;
  }
}

module.exports = createConnection;
