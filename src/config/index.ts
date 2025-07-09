import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

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
