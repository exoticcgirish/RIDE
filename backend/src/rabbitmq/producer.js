const { getChannel } = require("./connection.js");

const sendMessage = async (queueName, data) => {
  if (!queueName) {
    throw new Error("RabbitMQ queue name is required.");
  }

  if (data === undefined || data === null) {
    throw new Error("RabbitMQ message data is required.");
  }

  const channel = getChannel();

  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }

  await channel.assertQueue(queueName, {
    durable: true,
  });

  const message = Buffer.from(JSON.stringify(data));

  const sent = channel.sendToQueue(queueName, message, {
    persistent: true,
  });

  if (!sent) {
    throw new Error(`Failed to send message to queue: ${queueName}`);
  }

  console.log(`📤 Message sent → ${queueName}`);

  return true;
};

module.exports = {
  sendMessage,
};
