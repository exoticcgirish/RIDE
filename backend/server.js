const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const app = require("./src/app");
const dbFallback = require("./src/dbFallback");

const { connectRabbitMQ } = require("./src/rabbitmq/connection");

const { startConsumer } = require("./src/rabbitmq/consumer");

const isProd = process.env.NODE_ENV === "production";

const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;

  const defaultPort = Number(process.env.PORT || 7000);

  const host = process.env.HOST || "0.0.0.0";

  const portCandidates = isProd
    ? [defaultPort]
    : [defaultPort, defaultPort + 1, 7001, 7002, 7003];

  let candidateIndex = 0;

  if (!mongoUri) {
    console.warn("[WARN] MONGO_URI is not set. Enabling fallback mode.");

    dbFallback.enable();
  } else {
    try {
      await mongoose.connect(mongoUri);

      console.log("[INFO] Connected to MongoDB.");
    } catch (error) {
      console.warn(
        "[WARN] MongoDB connection failed; enabling fallback mode:",
        error.message,
      );

      dbFallback.enable();
    }
  }

  if (!process.env.RABBITMQ_URL) {
    console.warn("[WARN] RABBITMQ_URL is not set. RabbitMQ disabled.");
  } else {
    try {
      await connectRabbitMQ();

      console.log("[INFO] Connected to RabbitMQ.");

      await startConsumer();

      console.log("[INFO] RabbitMQ consumer started.");
    } catch (error) {
      console.warn("[WARN] RabbitMQ connection failed:", error.message);
    }
  }

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

    const shutdown = async (signal) => {
      console.log(`\n[INFO] ${signal} signal received. Shutting down...`);

      server.close(async () => {
        console.log("[INFO] HTTP server closed.");

        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();

            console.log("[INFO] Database connection closed.");
          }
        } catch (error) {
          console.error("[ERROR] Error closing database:", error.message);
        }

        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));

    process.once("SIGTERM", () => shutdown("SIGTERM"));
  };

  startApp();
};

startServer();
