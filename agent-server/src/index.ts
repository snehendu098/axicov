import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { agentRoutes } from "./api/routes";

const app = express();

app.use(express.json());

app.use("/", agentRoutes);
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
