import { WebSocketServer, WebSocket } from "ws";
import { SubscriptionManager } from "./subscriptionManager";
import { RedisSubscriber } from "./redisService";

export class WebSocketService {
    private wss: WebSocketServer;
    private subscriptionManager: SubscriptionManager;
    private redis: RedisSubscriber;
    private pingInterval: NodeJS.Timeout;

    constructor(private port: number, redisUrl: string) {
        this.redis = new RedisSubscriber(redisUrl);
        this.subscriptionManager = new SubscriptionManager(
            (s) => this.redis.subscribe(s),
            (s) => this.redis.unsubscribe(s)
        );

        this.redis.setMessageHandler((channel, message) => {
            const clients = this.subscriptionManager.getClients(channel);
            if (!clients) return;

            for (const ws of clients) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(message));
                }
            }
        });

        this.wss = new WebSocketServer({ port });
        console.log(`WebSocket server running on port ${port}`);

        this.wss.on("connection", ws => this.handleConnection(ws));

        this.pingInterval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    (ws as any).isAlive = false;
                    ws.ping();
                }
            });
        }, 30000);
    }

    private handleConnection(ws: WebSocket) {
        console.log("Client connected");
        (ws as any).isAlive = true;

        ws.on("pong", () => {
            (ws as any).isAlive = true;
        });

        ws.on("message", buffer => {
            try {
                const msg = JSON.parse(buffer.toString());

                switch (msg.op) {
                    case "subscribe":
                        this.subscriptionManager.addSubscription(ws, msg.channels || []);
                        ws.send(JSON.stringify({ op: "subscribed", channels: msg.channels }));
                        break;

                    case "unsubscribe":
                        this.subscriptionManager.removeSubscription(ws, msg.channels || []);
                        ws.send(JSON.stringify({ op: "unsubscribed", channels: msg.channels }));
                        break;

                    case "ping":
                        ws.send(JSON.stringify({ op: "pong" }));
                        break;

                    default:
                        ws.send(JSON.stringify({ op: "error", code: "UNSUPPORTED_OP" }));
                }

            } catch (err) {
                ws.send(JSON.stringify({ op: "error", code: "INVALID_MESSAGE" }));
            }
        });

        ws.on("close", () => {
            console.log("Client disconnected");
            this.subscriptionManager.removeSubscription(ws);
        });

        ws.on("error", (err) => {
            console.error("WebSocket client error:", err);
        });
    }

    shutdown() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.wss.close();
    }
}
