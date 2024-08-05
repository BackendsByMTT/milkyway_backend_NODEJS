import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import globalErrorHandler from "./dashboard/middleware/globalHandler";
import companyRoutes from "./dashboard/company/companyRoutes";
import userRoutes from "./dashboard/users/userRoutes";
import transactionRoutes from "./dashboard/transactions/transactionRoutes";
import gameRoutes from "./dashboard/games/gameRoutes";
import session from "express-session"
import { config } from "./config/config";
import { checkAdmin } from "./dashboard/middleware/checkAdmin";
import payoutRoutes from "./dashboard/payouts/payoutRoutes";
import { checkUser } from "./dashboard/middleware/checkUser";
import socketController from "./socket";

declare module "express-session" {
  interface Session {
    captcha?: string;
  }
}


const app = express();

app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: config.env === "development" ? false : true,
      maxAge: 86400000,
    },
  })
);



//cors config
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
const server = createServer(app);

// HEALTH ROUTES
app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };
  res.status(200).json(health);
});



app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/payouts", checkUser, checkAdmin, payoutRoutes)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketController(io);

app.use(globalErrorHandler);

export default server;
