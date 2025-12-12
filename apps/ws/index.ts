import { WebSocket,WebSocketServer} from "ws";
const PORT=8080;
const wss=new WebSocketServer({port:PORT});
console.log(`WebSocket server running on port ${PORT}`);
wss.on("connection",(ws:WebSocket)=>{
    console.log("websocket connection is establish!");

    ws.on("message",(data:any)=>{
        ws.send(data.toString())

    })


})
