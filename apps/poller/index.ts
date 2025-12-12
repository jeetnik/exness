import { WebSocket } from "ws";
import type { stream, Ticker } from "./lib/types";
import { pub } from "./lib/publisher";

const ws=new WebSocket("wss://stream.binance.com:9443/stream?streams=btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade")

ws.on("open",()=>{
    console.log("connection is done!")
    ws.on("message",async (data)=>{
            const streamdata=JSON.parse(data.toString()) as stream;
            const dbData: Ticker = {
                E: new Date(streamdata.data.E),
                T: new Date(streamdata.data.T),
                s: streamdata.data.s,
                t: streamdata.data.t,
                p: streamdata.data.p,
                q: streamdata.data.q
            }
           console.log(dbData.s);
            await pub(dbData.s,JSON.stringify(dbData));
            
    
    })
})

