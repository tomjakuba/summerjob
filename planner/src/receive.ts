#!/usr/bin/env node

import amqp from "amqplib";
import { PrismaDataSource } from "./datasources/Prisma";
import { BasicPlanner } from "./planners/BasicPlanner";
import { Planner } from "./planners/Planner";

const planner: Planner = new BasicPlanner(new PrismaDataSource());

async function main() {
  const connection = await amqp.connect(
    process.env.AMPQ_URL || "amqp://localhost"
  );

  const channel = await connection.createChannel();

  const queue = process.env.QUEUE_NAME || "planner";

  await channel.assertQueue(queue, { durable: false });

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

  await channel.consume(
    queue,
    (msg) => {
      console.log(" [x] Received %s", msg?.content.toString());
      if (!msg?.content) {
        console.log(" [x] No content");
        return;
      }
      onMessageReceived(msg.content.toString());
      console.log(" [x] Finished");
    },
    { noAck: true }
  );
}

function onMessageReceived(msg: string) {
  try {
    const message = JSON.parse(msg) as { planId: string };
    if (!message.planId || typeof message.planId !== "string") {
      console.log(" [x] No planId in message: %s", msg);
      return;
    }
    planner.start(message.planId);
  } catch (e) {
    console.log(" [x] Failed to parse message: %s", msg);
    return;
  }
}

main();
