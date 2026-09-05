const amqp = require("amqplib");

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  if (channel) {
    return channel;
  }

  const rabbitmqUrl = process.env.RABBITMQ_URL;

  if (!rabbitmqUrl) {
    throw new Error("RABBITMQ_URL is not defined.");
  }

  try {
    connection = await amqp.connect(rabbitmqUrl);

    channel = await connection.createChannel();

    await channel.prefetch(10);

    console.log("[INFO] RabbitMQ connected.");

    connection.on("error", (error) => {
      console.error("[ERROR] RabbitMQ connection:", error.message);
    });

    connection.on("close", () => {
      console.log("[INFO] RabbitMQ connection closed.");
      connection = null;
      channel = null;
    });

    channel.on("error", (error) => {
      console.error("[ERROR] RabbitMQ channel:", error.message);
    });

    channel.on("close", () => {
      console.log("[INFO] RabbitMQ channel closed.");
      channel = null;
    });

    return channel;
  } catch (error) {
    connection = null;
    channel = null;

    console.error("[ERROR] RabbitMQ connection failed:", error.message);

    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }

  return channel;
};

module.exports = {
  connectRabbitMQ,
  getChannel,
};
