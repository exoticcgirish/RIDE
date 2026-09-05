const { getChannel } = require("./connection.js");

const RIDE_CREATED_QUEUE = "ride_created";
const GROUP_CREATED_QUEUE = "group_created";
const GROUP_ACCEPTED_QUEUE = "group_accepted";
const RIDE_STARTED_QUEUE = "ride_started";
const RIDE_COMPLETED_QUEUE = "ride_completed";

const handleRideCreated = async (data) => {
  console.log("📥 Ride created event received:", data);
};

const handleGroupCreated = async (data) => {
  console.log("👥 Group created event received:", data);

  if (data.status === "ready") {
    console.log("🚗 Group is READY. Driver notification can start.");
  }
};

const handleGroupAccepted = async (data) => {
  console.log("✅ Group accepted event received:", data);
};

const handleRideStarted = async (data) => {
  console.log("▶️ Ride started event received:", data);
};

const handleRideCompleted = async (data) => {
  console.log("🏁 Ride completed event received:", data);
};

const processMessage = async (
  channel,
  message,
  handler,
  queueName,
) => {
  if (!message) {
    return;
  }

  try {
    const rawMessage =
      message.content.toString();

    const data = JSON.parse(rawMessage);

    await handler(data);

    channel.ack(message);
  } catch (error) {
    console.error(
      `❌ ${queueName} message processing error:`,
      error,
    );

    channel.nack(
      message,
      false,
      false,
    );
  }
};

const startConsumer = async () => {
  const channel = getChannel();

  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized.",
    );
  }

  const queues = [
    RIDE_CREATED_QUEUE,
    GROUP_CREATED_QUEUE,
    GROUP_ACCEPTED_QUEUE,
    RIDE_STARTED_QUEUE,
    RIDE_COMPLETED_QUEUE,
  ];

  for (const queue of queues) {
    await channel.assertQueue(queue, {
      durable: true,
    });
  }

  await channel.consume(
    RIDE_CREATED_QUEUE,
    (message) =>
      processMessage(
        channel,
        message,
        handleRideCreated,
        RIDE_CREATED_QUEUE,
      ),
  );

  await channel.consume(
    GROUP_CREATED_QUEUE,
    (message) =>
      processMessage(
        channel,
        message,
        handleGroupCreated,
        GROUP_CREATED_QUEUE,
      ),
  );

  await channel.consume(
    GROUP_ACCEPTED_QUEUE,
    (message) =>
      processMessage(
        channel,
        message,
        handleGroupAccepted,
        GROUP_ACCEPTED_QUEUE,
      ),
  );

  await channel.consume(
    RIDE_STARTED_QUEUE,
    (message) =>
      processMessage(
        channel,
        message,
        handleRideStarted,
        RIDE_STARTED_QUEUE,
      ),
  );

  await channel.consume(
    RIDE_COMPLETED_QUEUE,
    (message) =>
      processMessage(
        channel,
        message,
        handleRideCompleted,
        RIDE_COMPLETED_QUEUE,
      ),
  );

  console.log(
    `👂 Waiting for messages → ${RIDE_CREATED_QUEUE}`,
  );

  console.log(
    `👂 Waiting for messages → ${GROUP_CREATED_QUEUE}`,
  );

  console.log(
    `👂 Waiting for messages → ${GROUP_ACCEPTED_QUEUE}`,
  );

  console.log(
    `👂 Waiting for messages → ${RIDE_STARTED_QUEUE}`,
  );

  console.log(
    `👂 Waiting for messages → ${RIDE_COMPLETED_QUEUE}`,
  );

  console.log(
    "🐇 RabbitMQ consumer started successfully.",
  );
};

module.exports = {
  startConsumer,
};