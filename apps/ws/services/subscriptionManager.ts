import { WebSocket } from "ws";

export class SubscriptionManager {
    private channelToClients = new Map<string, Set<WebSocket>>();
    private clientToChannels = new Map<WebSocket, Set<string>>();
    private refCount = new Map<string, number>();

    constructor(private redisSubscribe: (s: string) => void,
                private redisUnsubscribe: (s: string) => void) {}

    addSubscription(ws: WebSocket, channels: string[]) {
        let userSet = this.clientToChannels.get(ws);
        if (!userSet) {
            userSet = new Set();
            this.clientToChannels.set(ws, userSet);
        }

        channels.forEach(channel => {
            channel = channel.toUpperCase();

            if (!userSet!.has(channel)) {
                userSet!.add(channel);

                let set = this.channelToClients.get(channel);
                if (!set) {
                    set = new Set();
                    this.channelToClients.set(channel, set);
                }
                set.add(ws);

                this.incrementSymbolRef(channel);
            }
        });
    }

    removeSubscription(ws: WebSocket, channels?: string[]) {
        const userSet = this.clientToChannels.get(ws);
        if (!userSet) return;

        const toRemove = channels ?? [...userSet];

        toRemove.forEach(channel => {
            channel =channel.toUpperCase();

            if (!userSet.has(channel)) return;

            userSet.delete(channel);

            const clientSet = this.channelToClients.get(channel);
            if (clientSet) {
                clientSet.delete(ws);
                if (clientSet.size === 0) {
                    this.decrementSymbolRef(channel);
                }
            }
        });

        if (userSet.size === 0) {
            this.clientToChannels.delete(ws);
        }
    }

    getClients(symbol: string): Set<WebSocket> | undefined {
        return this.channelToClients.get(symbol);
    }

    private incrementSymbolRef(channel: string) {
        const ref = (this.refCount.get(channel) || 0) + 1;
        this.refCount.set(channel, ref);
        if (ref === 1) this.redisSubscribe(channel);
    }

    private decrementSymbolRef(channel: string) {
        const ref = (this.refCount.get(channel) || 0) - 1;

        if (ref <= 0) {
            this.refCount.delete(channel);
            this.redisUnsubscribe(channel);
            this.channelToClients.delete(channel);
        } else {
            this.refCount.set(channel, ref);
        }
    }
}
