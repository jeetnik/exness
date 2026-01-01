import { WebSocket } from "ws";
import type { stream, Ticker, DepthUpdate } from "./lib/types";
import { pub } from "./lib/publisher";
import { consumer } from "./lib/consumer";
import { producer } from "./lib/producer";

const tradeStreams = "btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade";
const depthStreams = "btcusdt@depth@100ms/ethusdt@depth@100ms/solusdt@depth@100ms/xrpusdc@depth@100ms";

const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${tradeStreams}/${depthStreams}`);
consumer('db').catch(console.error);
console.log("consume is ready!");

ws.on("open", () => {
    console.log("connection is done!")
    ws.on("message", async (data) => {
        try {
            const streamdata = JSON.parse(data.toString()) as stream;

            if (streamdata.stream.includes('@trade')) {
                const tradeData = streamdata.data as any;
                const dbData: Ticker = {
                    E: new Date(tradeData.E),
                    T: new Date(tradeData.T),
                    s: tradeData.s,
                    t: tradeData.t,
                    p: tradeData.p,
                    q: tradeData.q
                }
                await pub(dbData.s, JSON.stringify(dbData));
                await producer('db', JSON.stringify(dbData));
            } else if (streamdata.stream.includes('@depth')) {
                const depthData = streamdata.data as DepthUpdate;
                await pub(`${depthData.s}_DEPTH`, JSON.stringify(depthData));
            }
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