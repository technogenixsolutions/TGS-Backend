import { jwtTokenSercretKey } from "../../secret.js";

import jwt from "jsonwebtoken";

export const authentication = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "JWT is required for accessing the route",
      });
    }

    jwt.verify(token, jwtTokenSercretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          statusCode: 401,
          message: "Invalid JWT token",
        });
      }

      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};
