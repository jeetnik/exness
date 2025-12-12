import { redisProducer } from "./redisconfig";

export async function producer(chan:string,data:string){
     await redisProducer.lpush(chan,data);

}