import { WebSocket } from "ws";
import type { stream, Ticker } from "./lib/types";
import { pub } from "./lib/publisher";
import { consumer } from "./lib/consumer";
import { producer } from "./lib/producer";


const ws=new WebSocket("wss://stream.binance.com:9443/stream?streams=btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade")
consumer('db').catch(console.error);
console.log("consume is ready!");
ws.on("open",()=>{
    console.log("connection is done!")
    ws.on("message",async (data)=>{
        try {
            const streamdata=JSON.parse(data.toString()) as stream;
            const dbData: Ticker = {
                E: new Date(streamdata.data.E),
                T: new Date(streamdata.data.T),
                s: streamdata.data.s,
                t: streamdata.data.t,
                p: streamdata.data.p,
                q: streamdata.data.q
            }
            await pub(dbData.s,JSON.stringify(dbData));
            await producer('db',JSON.stringify(dbData));
        } catch (error) {
            console.error('Error processing message:', error);
        }
    })
})

ws.on("error",(error)=>{
    console.error("WebSocket error:", error);
})


ws.on('close',()=>{
    console.log("Ws Server closed Gracefully");
});