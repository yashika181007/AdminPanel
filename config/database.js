const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'srv871.hstgr.io',
    user: 'u510451310_megastore',
    password: 'U510451310_megastore',
    database: 'u510451310_megastore',
    waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});

// Attempt to establish a connection
pool.getConnection((err, connection) => {
    if (err) {
        // If there's an error, display it
        console.error('Error connecting to the database:', err.message);
    } else {
        // If successful, display a connected message
        console.log('Connected to the database!');
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = pool.promise();
