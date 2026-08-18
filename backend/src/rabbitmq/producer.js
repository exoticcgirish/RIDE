const { getChannel } = require("./connection");

async function sendMessage(queueName, data) {
  const channel = getChannel();

  await channel.assertQueue(queueName, {
    durable: true,
  });

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(data)),
    {
      persistent: true,
    }
  );

  console.log(`📤 Message sent → ${queueName}`);
}

module.exports = {
  sendMessage,
};