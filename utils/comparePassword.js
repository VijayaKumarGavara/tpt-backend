import bcrypt from "bcrypt";

async function comparePassword(plainPassword, storedHash) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
  } catch (error) {
    throw error;
  }
}

export default comparePassword;


