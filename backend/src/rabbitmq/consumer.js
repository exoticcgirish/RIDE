const { getChannel } = require("./connection.js");

const startConsumer = async () => {
  const channel = getChannel();

  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }

  await channel.assertQueue("ride_created", {
    durable: true,
  });

  channel.consume("ride_created", (message) => {
    if (!message) return;

    try {
      const data = JSON.parse(message.content.toString());

      console.log("📥 Received ride:", data);

      channel.ack(message);
    } catch (error) {
      console.error("Ride message error:", error);

      channel.nack(message, false, false);
    }
  });
  await channel.assertQueue("group_created", {
    durable: true,
  });

  channel.consume("group_created", (message) => {
    if (!message) return;

    try {
      const data = JSON.parse(message.content.toString());

      console.log("👥 Group event received:", data);

      if (data.status === "ready") {
        console.log("🚗 Group is READY. Driver notification can start.");
      }

      channel.ack(message);
    } catch (error) {
      console.error("Group message error:", error);

      channel.nack(message, false, false);
    }
  });

  console.log("👂 Waiting for messages → ride_created");

  console.log("👂 Waiting for messages → group_created");

  console.log("RabbitMQ consumer started.");
};

module.exports = {
  startConsumer,
};
