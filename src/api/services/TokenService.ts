const jwt = require("jsonwebtoken");

const generateToken = async (username: string, id: string): Promise<string> => {
  return jwt.sign(
    {
      name: username,
      id: id,
    },
    // TOKEN_SECRET
    process.env.TOKEN_SECRET,
    // EXPIRATION TIME
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = {
  generateToken,
};
