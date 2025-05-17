import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "0.0.0.0",
  port: +(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // required for BullMQ worker
});

export default redis;
