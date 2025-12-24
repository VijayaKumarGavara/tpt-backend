import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import ConnectDB from "./dbConnection.js";
import hashPassword from "./utils/hashPassword.js";
import comparePassword from "./utils/comparePassword.js";
import { generateToken } from "./utils/jwt.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import { dbQuery } from "./dbQuery.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cors({
  origin: "*", // later you can restrict
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const pool = ConnectDB();

const today = new Date().toISOString().split("T")[0];
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// app.get("/api/farmers", authMiddleware, async (req, res) => {
//   try {
//     const { name, village, mobile, farmer_id } = req.query;

//     let query = "SELECT * FROM farmers";
//     let values = [];

//     if (farmer_id) {
//       query += " WHERE farmer_id = ?";
//       values.push(farmer_id);
//     } else if (mobile) {
//       query += " WHERE mobile = ?";
//       values.push(mobile);
//     } else if (name && village) {
//       query += " WHERE LOWER(name) LIKE ? AND LOWER(village) LIKE ?";
//       values.push(`%${name.toLowerCase()}%`, `%${village.toLowerCase()}%`);
//     }

//     const [rows] = await pool.query(query, values);

//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to search farmers",
//     });
//   }
// });

// app.get("/api/farmers", authMiddleware, async (req, res) => {
//   try {
//     const { farmer_id, mobile, name, village } = req.query;

//     let conditions = [];
//     let values = [];

//     if (farmer_id) {
//       conditions.push("farmer_id = ?");
//       values.push(farmer_id);
//     }

//     if (mobile) {
//       conditions.push("mobile = ?");
//       values.push(mobile);
//     }

//     if (name) {
//       conditions.push("LOWER(name) LIKE ?");
//       values.push(`%${name.toLowerCase()}%`);
//     }

//     if (village) {
//       conditions.push("LOWER(village) LIKE ?");
//       values.push(`%${village.toLowerCase()}%`);
//     }

//     let query = "SELECT * FROM farmers";

//     if (conditions.length > 0) {
//       query += " WHERE " + conditions.join(" AND ");
//     }

//     const [rows] = await pool.query(query, values);

//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to search farmers",
//     });
//   }
// });

// app.post("/api/farmers", authMiddleware, async (req, res) => {
//   try {
//     const { name, village, mobile } = req.body;

//     if (!name || !village) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }
//     const farmer_id = `F${Date.now()}`;
//     await pool.query(
//       `INSERT INTO farmers (farmer_id, name, village, mobile)
//        VALUES (?, ?, ?, ?)`,
//       [farmer_id, name, village, mobile || null]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Farmer created successfully",
//       data: { farmer_id, name, village, mobile },
//     });
//   } catch (error) {
//     console.error(error);

//     // duplicate PK handling
//     if (error.code === "ER_DUP_ENTRY") {
//       return res.status(409).json({
//         success: false,
//         isAlreadyExists:true,
//         message: "Farmer already exists",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create farmer",
//     });
//   }
// });

// app.get("/api/tractor-works", authMiddleware, async (req, res) => {
//   try {
//     const query = `select farmers.farmer_id, farmers.name, t.work_type, t.pricing_context, t.unit_type, t.notes,t.quantity,t.rate,t.total_amount, DATE_FORMAT(t.work_date, '%Y-%m-%d') AS work_date
// from tractor_works as t
// INNER JOIN farmers on farmers.farmer_id=t.farmer_id;`;

//     const [rows] = await pool.query(query);
//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get Tractor Works",
//     });
//   }
// });

// app.post("/api/tractor-works", authMiddleware, async (req, res) => {
//   const {
//     farmer_id,
//     work_type,
//     pricing_context,
//     unit_type,
//     notes,
//     quantity,
//     rate,
//   } = req.body;

//   const total_amount = quantity * rate;
//   const db = await pool.getConnection();

//   try {
//     await db.beginTransaction();

//     // 1️⃣ Insert tractor work
//     const workId = `W${Date.now()}`;

//     await db.query(
//       `INSERT INTO tractor_works 
//       (work_id, farmer_id, work_type, pricing_context, unit_type, notes, quantity, rate, total_amount, work_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         workId,
//         farmer_id,
//         work_type,
//         pricing_context ? JSON.stringify(pricing_context) : null,
//         unit_type,
//         notes,
//         quantity,
//         rate,
//         total_amount,
//         today,
//       ]
//     );

//     // 2️⃣ Check existing payment due
//     const [existingDue] = await db.query(
//       "SELECT * FROM payment_dues WHERE farmer_id = ?",
//       [farmer_id]
//     );

//     if (existingDue.length > 0) {
//       // update
//       await db.query(
//         `UPDATE payment_dues 
//          SET amount_due = amount_due + ?, updated_at = CURDATE()
//          WHERE farmer_id = ?`,
//         [total_amount, farmer_id]
//       );
//     } else {
//       // create
//       const dueId = `D${Date.now()}`;

//       await db.query(
//         `INSERT INTO payment_dues 
//         (due_id, farmer_id, amount_due, amount_paid, status, updated_at)
//         VALUES (?, ?, ?, 0, 'pending', CURDATE())`,
//         [dueId, farmer_id, total_amount]
//       );
//     }

//     await db.commit();

//     res.status(201).json({
//       success: true,
//       message: "Tractor work added successfully",
//       work_id: workId,
//     });
//   } catch (error) {
//     await db.rollback();
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to add tractor work",
//     });
//   } finally {
//     db.release();
//   }
// });

// app.get("/api/payment-dues", authMiddleware, async (req, res) => {
//   const { farmer_id } = req.query;

//   try {
//     let query = `
//       SELECT 
//         farmers.name,
//         farmers.village,
//         payment_dues.farmer_id,
//         payment_dues.due_id,
//         payment_dues.amount_due,
//         payment_dues.amount_paid,
//         payment_dues.status
//       FROM payment_dues
//       INNER JOIN farmers 
//         ON payment_dues.farmer_id = farmers.farmer_id
//     `;

//     const values = [];

//     if (farmer_id) {
//       query += " WHERE payment_dues.farmer_id = ?";
//       values.push(farmer_id);
//     }

//     const [rows] = await pool.query(query, values);

//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get Payment Dues",
//     });
//   }
// });

// app.post("/api/payment", authMiddleware, async (req, res) => {
//   const { farmer_id, due_id, amount, payment_mode } = req.body;

//   if (!farmer_id || !due_id || !amount || amount <= 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid payment data",
//     });
//   }
//   const db = await pool.getConnection();
//   try {
//     await db.beginTransaction();

//     // 1️⃣ Get current due
//     const [rows] = await db.query(
//       "SELECT * FROM payment_dues WHERE due_id = ?",
//       [due_id]
//     );

//     if (rows.length === 0) {
//       throw new Error("Due not found");
//     }

//     const due = rows[0];

//     if (amount > due.amount_due) {
//       throw new Error("Payment exceeds due amount");
//     }

//     const newAmountDue = due.amount_due - amount;
//     const newAmountPaid = due.amount_paid + amount;
//     const status = newAmountDue === 0 ? "paid" : "partial";

//     // 2️⃣ Update payment_dues
//     await db.query(
//       `UPDATE payment_dues
//        SET amount_due = ?, amount_paid = ?, status = ?, updated_at = ?
//        WHERE due_id = ?`,
//       [newAmountDue, newAmountPaid, status, today, due_id]
//     );

//     // 3️⃣ Insert transaction
//     const transactionId = `T${Date.now()}`;

//     await db.query(
//       `INSERT INTO transactions
//        (transaction_id, farmer_id, due_id, amount, payment_mode, payment_date)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [transactionId, farmer_id, due_id, amount, payment_mode, today]
//     );

//     await db.commit();

//     res.status(201).json({
//       success: true,
//       message: "Payment recorded successfully",
//     });
//   } catch (error) {
//     await db.rollback();
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: error.message || "Payment failed",
//     });
//   } finally {
//     db.release();
//   }
// });

// app.get("/api/transactions", authMiddleware, async (req, res) => {
//   try {
//     const query = `select farmers.name, t.amount, t.payment_mode, DATE_FORMAT(t.payment_date, '%Y-%m-%d') AS payment_date from transactions as t
//     INNER JOIN farmers ON farmers.farmer_id=t.farmer_id order by t.payment_date desc;`;
//     const [rows] = await pool.query(query);
//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to search farmers",
//     });
//   }
// });

app.post("/api/tractor-drivers/login", async (req, res) => {
  try {
    const { driver_mobile, driver_password } = req.body;
    if (!driver_mobile || !driver_password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const [rows] = await pool.query(
      `SELECT driver_id, driver_name, driver_village, driver_mobile, driver_password FROM tractor_drivers WHERE driver_mobile=?`,
      [driver_mobile]
    );
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await comparePassword(
      driver_password,
      rows[0]?.driver_password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credetials",
      });
    }

    const token = generateToken({
      driver_id: rows[0]?.driver_id,
      driver_mobile: rows[0]?.driver_mobile,
      driver_name: rows[0]?.driver_name,
      driver_village: rows[0]?.driver_village,
    });
    res.status(200).json({
      success: true,
      count: 1,
      token,
      data: {
        driver_id: rows[0].driver_id,
        driver_name: rows[0].driver_name,
        driver_village: rows[0].driver_village,
        driver_mobile: rows[0].driver_mobile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Login. Please try after sometime",
    });
  }
});

app.post("/api/tractor-drivers/register", async (req, res) => {
  try {
    const { driver_village, driver_name, driver_mobile, driver_password } =
      req.body;
    if (!driver_village || !driver_name || !driver_mobile || !driver_password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const driver_id = `D${Date.now()}`;
    const hashed_driver_password = await hashPassword(driver_password);

    await dbQuery(
      `INSERT INTO tractor_drivers (driver_id,driver_village,driver_name, driver_mobile, driver_password, is_active) VALUES (?,?,?,?,?,?)`,
      [
        driver_id,
        driver_village,
        driver_name,
        driver_mobile,
        hashed_driver_password,
        true,
      ]
    );
    res.status(201).json({
      success: true,
      message: "Tractor Driver created successfully",
      data: { driver_id, driver_village, driver_name, driver_mobile },
    });
  } catch (error) {
    console.error(error);

    // duplicate PK handling
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Tractor driver already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create tractor driver",
    });
  }
});





app.get("/api/tractor-drivers/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: req.driver,
  });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
