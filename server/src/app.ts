import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import

import eventRouter from "./routes/event.routes";
import agentRouter from "./routes/agent.routes";

app.use("/api/events", eventRouter);
app.use("/api/agent", agentRouter);

export { app };
