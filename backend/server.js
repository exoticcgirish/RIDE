const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dbFallback = require("./src/dbFallback");
const app = require("./src/app");

dotenv.config();

// Disable console logs

console.log = () => {};

console.info = () => {};

console.warn = () => {};

const isProd = process.env.NODE_ENV === "production";

const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;
  const defaultPort = Number(process.env.PORT || 7000);
  const host = process.env.HOST || (isProd ? "0.0.0.0" : "127.0.0.1");
  const portCandidates = isProd
    ? [defaultPort]
    : [defaultPort, defaultPort + 1, 7000, 7001, 7002];
  let candidateIndex = 0;

  const startApp = () => {
    const port = portCandidates[candidateIndex];
    const server = app.listen(port, host, () => {
      console.log(
        `[INFO] Server listening on http://${host}:${port} (${process.env.NODE_ENV || "development"})`,
      );
    });

    server.on("error", (err) => {
      if (
        (err.code === "EADDRINUSE" || err.code === "EPERM") &&
        candidateIndex < portCandidates.length - 1
      ) {
        const failedPort = portCandidates[candidateIndex];
        candidateIndex += 1;
        console.warn(
          `[WARN] Port ${failedPort} unavailable. Trying port ${portCandidates[candidateIndex]}...`,
        );
        startApp();
        return;
      }

      console.error("[ERROR] Failed to start server:", err.message);
      process.exit(1);
    });

    // Graceful Shutdown on termination signals
    const shutdown = (signal) => {
      console.log(`\n[INFO] ${signal} signal received. Closing HTTP server...`);
      server.close(async () => {
        console.log("[INFO] HTTP server closed.");
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log("[INFO] Database connection closed.");
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  };

  if (!mongoUri) {
    console.warn("[WARN] MONGO_URI is not set. Enabling fallback mode.");
    dbFallback.enable();
    startApp();
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("[INFO] Connected to MongoDB.");
    startApp();
  } catch (error) {
    console.warn(
      "[WARN] MongoDB connection failed; enabling fallback mode:",
      error.message,
    );
    dbFallback.enable();
    startApp();
  }
};

startServer();
