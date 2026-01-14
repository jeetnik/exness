import { WebSocket } from "ws";
import type { stream, Ticker, DepthUpdate } from "./lib/types";
import { pub } from "./lib/publisher";
import { consumer } from "./lib/consumer";
import { producer } from "./lib/producer";

const tradeStreams = "btcfdusd@trade/ethusdt@trade/usdcusdt@trade/solusdt@trade/btcusdt@trade/ethfdusd@trade/ethusdc@trade/xrpusdc@trade/solfdusd@trade/solusdc@trade/bnbusdt@trade/xrpusdt@trade/adausdt@trade";
const depthStreams = "btcusdt@depth@100ms/ethusdt@depth@100ms/solusdt@depth@100ms/xrpusdc@depth@100ms/bnbusdt@depth@100ms/xrpusdt@depth@100ms/adausdt@depth@100ms";

let ws: WebSocket;
let pingInterval: NodeJS.Timeout;
let reconnectTimeout: NodeJS.Timeout;
let maxConnectionTimeout: NodeJS.Timeout;
let isReconnecting = false;
let isAlive = false;
let missedPongs = 0;

consumer('db').catch(console.error);
console.log("consume is ready!");

function connectWebSocket() {
    if (isReconnecting) {
        console.log('[POLLER] Already reconnecting, skipping...');
        return;
    }

    console.log('[POLLER] Initiating WebSocket connection...');
    ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${tradeStreams}/${depthStreams}`);
    isAlive = false;
    missedPongs = 0;

    ws.on("open", () => {
        console.log("WebSocket connection established!");
        isReconnecting = false;
        isAlive = true;
        missedPongs = 0;

        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                if (!isAlive) {
                    missedPongs++;
                    console.warn(`[POLLER] Missed pong #${missedPongs}`);

                    if (missedPongs >= 3) {
                        console.error('[POLLER] Connection dead (3 missed pongs). Terminating...');
                        ws.terminate();
                        return;
                    }
                }

                isAlive = false;
                ws.ping();
            }
        }, 30000);

        if (maxConnectionTimeout) clearTimeout(maxConnectionTimeout);
        maxConnectionTimeout = setTimeout(() => {
            console.log('[POLLER] 23 hours reached. Proactively reconnecting to Binance...');
            ws.close();
        }, 23 * 60 * 60 * 1000);
    });

    ws.on("message", async (data) => {
        try {
            const streamdata = JSON.parse(data.toString()) as stream;
            console.log(`[POLLER] Received message on stream: ${streamdata.stream}`);

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
                console.log(`[POLLER] Publishing to Redis channel: ${dbData.s}, price: ${tradeData.p}`);
                await pub(dbData.s, JSON.stringify(dbData));
                await producer('db', JSON.stringify(dbData));
            } else if (streamdata.stream.includes('@depth')) {
                const depthData = streamdata.data as DepthUpdate;
                console.log(`[POLLER] Publishing depth data for: ${depthData.s}`);
                await pub(`${depthData.s}_DEPTH`, JSON.stringify(depthData));
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on("pong", () => {
        isAlive = true;
        missedPongs = 0;
        console.log("Received pong from Binance - connection alive");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    ws.on('close', () => {
        console.log("WebSocket connection closed. Reconnecting in 5 seconds...");

        if (pingInterval) clearInterval(pingInterval);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (maxConnectionTimeout) clearTimeout(maxConnectionTimeout);

        if (isReconnecting) {
            console.log('[POLLER] Reconnection already scheduled, skipping...');
            return;
        }

        isReconnecting = true;
        reconnectTimeout = setTimeout(() => {
            isReconnecting = false;
            connectWebSocket();
        }, 5000);
    });
}

connectWebSocket();

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    if (pingInterval) clearInterval(pingInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (maxConnectionTimeout) clearTimeout(maxConnectionTimeout);
    if (ws) ws.close();
    process.exit(0);
});