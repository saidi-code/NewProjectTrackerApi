import session from "express-session";
import { SessionOptions } from "express-session";
import config from "../config";
const sessionConfig: SessionOptions = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
  // For production, you might want to add:
  // store: new RedisStore({ client: redisClient })
};

export default session(sessionConfig);
