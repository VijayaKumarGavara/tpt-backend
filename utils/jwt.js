import jwt from "jsonwebtoken";

const JWT_SECRET = "tractor_track_secret_key";

const generateToken = (paypload) => {
  return jwt.sign(paypload, JWT_SECRET, { expiresIn: "7d" });
};

const verify = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export { generateToken, verify };
