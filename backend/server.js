const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dbFallback = require("./src/dbFallback");

dotenv.config();

// Disable console logs
console.log = () => {};
console.info = () => {};
console.warn = () => {};

const app = require("./src/app");

const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;
  const defaultPort = Number(process.env.PORT || 7000);
  const host = process.env.HOST || "127.0.0.1";
  const portCandidates = [defaultPort, defaultPort + 1, 7000, 7001, 7002];
  let candidateIndex = 0;

  const startApp = () => {
    const port = portCandidates[candidateIndex];
    const server = app.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
    });

    server.on("error", (err) => {
      if (
        (err.code === "EADDRINUSE" || err.code === "EPERM") &&
        candidateIndex < portCandidates.length - 1
      ) {
        const failedPort = portCandidates[candidateIndex];
        candidateIndex += 1;
        console.warn(
          `Port ${failedPort} is unavailable or not allowed; trying port ${portCandidates[candidateIndex]} instead.`,
        );
        startApp();
        return;
      }

      console.error("Failed to start server:", err.message);
      process.exit(1);
    });
  };

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Starting in fallback mode.");
    dbFallback.enable();
    startApp();
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    startApp();
  } catch (error) {
    console.warn(
      "MongoDB connection failed; starting in fallback mode:",
      error.message,
    );
    dbFallback.enable();
    startApp();
  }
};

startServer();
