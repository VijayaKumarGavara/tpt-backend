import mysql from "mysql2/promise";
import config from "./config.js";

let pool;

function ConnectDB() {
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
  });

  if (!pool) {
    pool = mysql.createPool(config.db); // 👈 already promise-based
    console.log("MySql Pool created successfully.");
  }
  return pool;
}

export default ConnectDB;
