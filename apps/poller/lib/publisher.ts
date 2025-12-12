import Redis from "ioredis";

const redisUrl=process.env.REDIS_URL || 'redis://localhost:6379';
const publisher = new Redis(redisUrl);

export async function pub(chan:string,data:string){
 await publisher.publish(chan,data);
}