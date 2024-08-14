const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'u510451310_megastore',
    password: 'U510451310_megastore',
    database: 'u510451310_megastore',
    waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});
module.exports = pool.promise();
