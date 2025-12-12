import { WebSocket,WebSocketServer} from "ws";
import Redis from "ioredis";
const redisUrl=process.env.REDIS_URL||"redis://localhost:6379"
const subscriber=new Redis(redisUrl);
const PORT=8080;
const wss=new WebSocketServer({port:PORT});
console.log(`WebSocket server running on port ${PORT}`);


subscriber.on("message",(channel,message)=>{
    wss.clients.forEach((client)=>{
        if(client.readyState===WebSocket.OPEN){
            client.send(message);
        }
    });
});

wss.on("connection",(ws:WebSocket)=>{
    console.log("websocket connection is establish!");

    ws.on("message",async (data:any)=>{
        const parsemsg=JSON.parse(data.toString());
        if(parsemsg.subscribe){
            await subscriber.subscribe(parsemsg.chan);
            ws.send(JSON.stringify(data.toString()));

        }
        if(parsemsg.unsubscribe){
            await subscriber.unsubscribe(parsemsg.chan);
        }

    })

    ws.on("close",()=>{
        console.log("Client disconnected");
    });
})
