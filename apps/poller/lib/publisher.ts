import { publisher } from "./redisconfig";

export async function pub(chan:string,data:string){
 await publisher.publish(chan,data);
}