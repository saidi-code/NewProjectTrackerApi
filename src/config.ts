import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DB_USER_NAME: process.env.DB_USER_NAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "exemple",
  DB_PORT: process.env.DB_PORT || 27017,
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_NAME: process.env.DB_NAME || "task-manager",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/task-manager",
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  EMAIL_USER: process.env.EMAIL_USER || "your-email@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "your-email-password",
  EMAIL_FROM: process.env.EMAIL_FROM || "your-email@gmail.com",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
