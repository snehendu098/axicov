import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { agentRoutes } from "./api/routes";
import { errorHandler } from "./utils/errorHandler";

const app = express();

// Process level error handlers to prevent crashing
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  // Log the error but don't exit
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
  // Log the error but don't exit
});

app.use(express.json());

app.use("/api", agentRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// Wrap server startup in try-catch
try {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
} catch (error) {
  console.error("Error during server startup:", error);
  // Don't exit, just log the error
}
