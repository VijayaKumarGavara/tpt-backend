import ConnectDB from "./dbConnection.js";

const pool = ConnectDB();

export const dbQuery = (sql, values = []) => {
  console.log("SQL:", sql);
  console.log("Values:", values);
  return pool.query(sql, values);
};
