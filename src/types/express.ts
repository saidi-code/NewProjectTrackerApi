import User from "../models/user";
import { IUser } from "./user";
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
