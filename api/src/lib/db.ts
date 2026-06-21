import mysql from 'mysql';

const pool = mysql.createPool({
  host: process.env.dbHost,
  user: process.env.dbUser,
  database: process.env.dbName,
  password: process.env.dbPass,
  port: Number(process.env.dbPort) || 3306,
  multipleStatements: true,
  connectionLimit: 10,
});

export default pool;
