import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

export default {
  port: parseInt(process.env.PORT!, 10),
  /**
   * Datebase URI
   */
  databaseURI: process.env.DATABASE_URI,
  /**
   * JWT secrets
   */
  jwtSecret: process.env.JWT_SECRET,
  /**
   * API configs
   */
  api: {
    prefix: "/api",
  },
};
