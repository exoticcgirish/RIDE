const amqp = require("amqplib");

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    console.log("[INFO] RabbitMQ connected.");

    connection.on("error", (error) => {
      console.error("[ERROR] RabbitMQ connection:", error.message);
    });

    connection.on("close", () => {
      console.log("[INFO] RabbitMQ connection closed.");
    });

    return channel;
  } catch (error) {
    console.error("[ERROR] RabbitMQ connection failed:", error.message);

    throw error;
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }

  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel,
};
