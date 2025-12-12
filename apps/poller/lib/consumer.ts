import { redisConsumer } from "./redisconfig";
import { insertTrade } from "../db/insertdata";

export async function consumer(chan:string){
    while(true){
       try{
        const result=await redisConsumer.brpop(chan,0);
        if(result){
            const [,message]=result;
            const datadb=JSON.parse(message);
            insertTrade(datadb);
        }
       }catch(error){
        console.error('Error processing queue message:', error);
       }

    }

}