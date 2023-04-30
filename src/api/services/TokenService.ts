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
    { expiresIn: "10m" }
  );

  const refreshToken = jwt.sign(
    {
      name: username,
      id: id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFERSH_EXPIRES_IN }
  );

  const tokens = [accessToken, refreshToken];
  return tokens;
};

const generateNewAccesToken = async (
  refreshToken: string,
  userWithRefreshToken: string
) => {
  return jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err || userWithRefreshToken !== decoded.id) {
        throw new Error("WRONG");
      }
      const accessToken = jwt.sign(
        { name: decoded.name, id: decoded.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "10m" }
      );
      return accessToken;
    }
  );
};
const tokenService = {
  generateToken,
  generateNewAccesToken,
};

export default tokenService;
