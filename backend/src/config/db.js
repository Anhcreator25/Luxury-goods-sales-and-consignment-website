import mysql from 'mysql2/promise'

// Create a connection to the database
 export  const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
if (err) throw err;
console.log("Connected to MySQL!");
})
export default connection;