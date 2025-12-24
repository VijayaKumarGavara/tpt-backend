// dbConnect.js
import mysql from "mysql2/promise";
import config from "./config.js";

let pool;

async function ConnectDB() {
  if (!pool) {
    pool = mysql.createPool(config.db);
    console.log("MySql Pool created successfully.");
  }
  return pool;
}

export default ConnectDB;
