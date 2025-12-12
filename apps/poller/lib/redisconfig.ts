import Redis from "ioredis";

const redisUrl=process.env.REDIS_URL||"redis://localhost:6379"

export const redisConsumer=new Redis(redisUrl);
export const redisProducer=new Redis(redisUrl);
export const publisher=new Redis(redisUrl);
