const jwt = require("jsonwebtoken");

const generateToken = async (
  username: string,
  id: string
): Promise<string[]> => {
  const accessToken = jwt.sign(
    {
      name: username,
      id: id,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    {
      name: username,
      id: id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const tokens = [accessToken, refreshToken];
  return tokens;
};
const tokenService = {
  generateToken,
};

export default tokenService;
