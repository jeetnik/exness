"use client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export type MarketData = {
    p: string;
    T: string;
    s?: string;
};

type MessageHandler = (channel: string, data: MarketData) => void;

class WebSocketClient {
    private ws: WebSocket | null = null;
    private subscribers: Map<string, Set<MessageHandler>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;
    private isManualClose = false;
    private subscribedChannels: Set<string> = new Set();

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.isManualClose = false;
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('[WS] Connected');
            this.reconnectAttempts = 0;

            if (this.subscribedChannels.size > 0) {
                this.send({
                    op: 'subscribe',
                    channels: Array.from(this.subscribedChannels),
                });
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.op === 'subscribed' || data.op === 'unsubscribed') {
                    return;
                }

                if (data.p && data.T) {
                    const channel = data.s || Array.from(this.subscribedChannels)[0] || 'UNKNOWN';
                    const handlers = this.subscribers.get(channel);
                    if (handlers) {
                        handlers.forEach(handler => handler(channel, data));
                    }
                }
            } catch (error) {
                console.error('[WS] Parse error:', error);
            }
        };

        this.ws.onerror = () => {
            console.error('[WS] Error');
        };

        this.ws.onclose = () => {
            console.log('[WS] Closed');

            if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
                console.log(`[WS] Reconnecting in ${delay}ms...`);

                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, delay);
            }
        };
    }

    subscribe(channels: string[], handler: MessageHandler) {
        channels.forEach(channel => {
            if (!this.subscribers.has(channel)) {
                this.subscribers.set(channel, new Set());
            }
            this.subscribers.get(channel)!.add(handler);
            this.subscribedChannels.add(channel);
        });

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.send({ op: 'subscribe', channels });
        }
    }

    unsubscribe(channels: string[], handler?: MessageHandler) {
        channels.forEach(channel => {
            if (handler) {
                this.subscribers.get(channel)?.delete(handler);
                if (this.subscribers.get(channel)?.size === 0) {
                    this.subscribers.delete(channel);
                    this.subscribedChannels.delete(channel);
                }
            } else {
                this.subscribers.delete(channel);
                this.subscribedChannels.delete(channel);
            }
        });

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.send({ op: 'unsubscribe', channels });
        }
    }

    private send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    disconnect() {
        this.isManualClose = true;
        this.ws?.close();
        this.ws = null;
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const wsClient = new WebSocketClient();
