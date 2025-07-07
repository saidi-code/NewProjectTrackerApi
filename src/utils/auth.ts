import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../types/auth";
import config from "../config";

export const createToken = (userId: string, role: string = "user"): string => {
  return jwt.sign({ userId, role } as AuthTokenPayload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as AuthTokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.hash(password, 12);
};
