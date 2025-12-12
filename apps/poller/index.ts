import { WebSocket } from "ws";

const ws=new WebSocket("wss://stream.binance.com:9443/stream?streams=btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade")

ws.on("open",()=>{
    console.log("connection is done!")
})

ws.on("message",(data)=>{
    const message = JSON.parse(data.toString())
    console.log(message)
})
