import bcrypt from "bcryptjs";
import { AuthTokenPayload } from "../types/auth";
import config from "../config/config";
import { IUser } from "../types/user";

export const verifyPassword = async (
  candidatePassword: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(candidatePassword, hash);
};

export const passportVerify = async (
  user: IUser,
  candidatePassword: string
): Promise<boolean> => {
  if (!user || !user.password) return false;
  return verifyPassword(candidatePassword, user.password);
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};
