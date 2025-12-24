import ConnectDB from "./dbConnection.js";

const pool = ConnectDB();

export const dbQuery = (sql, values = []) => {
  return pool.query(sql, values);
};
