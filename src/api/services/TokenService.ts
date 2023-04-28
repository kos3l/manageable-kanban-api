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
  console.log(
    accessToken,
    "created access token - token service - create token"
  );
  console.log(
    refreshToken,
    "created refresh token - token service - create token"
  );
  console.log(
    process.env.REFRESH_TOKEN_SECRET,
    "refresh token secret - token service"
  );
  console.log(
    process.env.TOKEN_SECRET,
    "access token secret - token service - create token"
  );
  const tokens = [accessToken, refreshToken];
  return tokens;
};

const generateNewAccesToken = async (
  refreshToken: string,
  userWithRefreshToken: string
) => {
  console.log(
    process.env.REFRESH_TOKEN_SECRET,
    "refresh token secret - token service - generate new access token"
  );
  console.log(
    refreshToken,
    "sent refrsh token - token service - generate new access token"
  );
  console.log(
    process.env.TOKEN_SECRET,
    "access token secret - token service - generate new access token"
  );
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
