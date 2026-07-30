const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./src/app");

const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;
  const defaultPort = Number(process.env.PORT || 5001);
  let port = defaultPort;

  const startApp = () => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (port === defaultPort) {
          port = defaultPort + 1;
          console.warn(
            `Port ${defaultPort} is busy, trying port ${port} instead.`,
          );
          startApp();
          return;
        }
      }
      console.error("Failed to start server:", err.message);
      process.exit(1);
    });
  };

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Please add it to your .env file.");
    startApp();
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    startApp();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    startApp();
  }
};

startServer();
