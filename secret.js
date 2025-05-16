import "dotenv/config";

export const port = process.env.PORT;
export const dbString = process.env.DB_STRING;
export const frontEndUrl = process.env.FRONT_END_URL;
export const jwtTokenSercretKey = process.env.JWT_TOKEN_SECRET_KEY;
export const accountAccessName = process.env.COOKI_NAME;
export const cookiSecretKey = process.env.COOKI_SECRET_KEY;
