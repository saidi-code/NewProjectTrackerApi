import express from "express";
import passport from "./config/passport";
import cors from "cors";
import session from "./config/session";
import { errorHandler } from "./middlewares/error";
import appRoutes from "./routes";
import { initMongoDB } from "./utils/db";
import config from "./config/config";
import { initSocket } from "./server/socket";
import http from "http";
const app = express();
const server = http.createServer(app);
async function initApp() {
  await initMongoDB();
  app.use(
    cors({
      origin: "http://localhost:3000", // Specify the allowed origin
      credentials: true, // Allow cookies/auth headers
    })
  );
  app.use(express.json());
  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/api/v1", appRoutes);
  app.get("/healthz", (req: any, res: any) => {
    res.status(200).json({ msg: "Server 🆗👌" });
  });
  app.use(errorHandler);
  // Initialize Socket.IO
  initSocket(server);
  server.listen(config.PORT, () => {
    console.log(`Server Start At Port: ${config.PORT} 🚀`);
  });
}
initApp();
