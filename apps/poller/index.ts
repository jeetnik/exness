import { WebSocket } from "ws";
import type { stream, Ticker, DepthUpdate } from "./lib/types";
import { pub } from "./lib/publisher";
import { consumer } from "./lib/consumer";
import { producer } from "./lib/producer";

const tradeStreams = "btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade";
const depthStreams = "btcusdt@depth@100ms/ethusdt@depth@100ms/solusdt@depth@100ms/xrpusdc@depth@100ms";

let ws: WebSocket;
let pingInterval: NodeJS.Timeout;
let reconnectTimeout: NodeJS.Timeout;
let isReconnecting = false;

consumer('db').catch(console.error);
console.log("consume is ready!");

function connectWebSocket() {
    if (isReconnecting) return;

    ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${tradeStreams}/${depthStreams}`);

    ws.on("open", () => {
        console.log("WebSocket connection established!");
        isReconnecting = false;

        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            }
        }, 30000);
    });

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
    });

    ws.on("pong", () => {
        console.log("Received pong from Binance");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    ws.on('close', () => {
        console.log("WebSocket connection closed. Reconnecting in 5 seconds...");

        if (pingInterval) clearInterval(pingInterval);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);

        isReconnecting = true;
        reconnectTimeout = setTimeout(() => {
            connectWebSocket();
        }, 5000);
    });
}

connectWebSocket();

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    if (pingInterval) clearInterval(pingInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) ws.close();
    process.exit(0);
});