import Redis from "ioredis";

export type RedisMessageHandler = (channel: string, message: any) => void;

export class RedisSubscriber {
    private redis: Redis;
    private handler: RedisMessageHandler | null = null;

    constructor(private redisUrl: string) {
        this.redis = new Redis(redisUrl);

        this.redis.on("message", (channel, msg) => {
            if (this.handler) {
                try {
                    this.handler(channel, JSON.parse(msg));
                } catch (e) {
                    console.error("Error parsing Redis message:", e);
                }
            }
        });

        this.redis.on("connect", () => console.log("Redis connected"));
        this.redis.on("reconnecting", () => console.log("Redis reconnecting"));
        this.redis.on("error", (err) => console.error("Redis error:", err));
    }

    setMessageHandler(handler: RedisMessageHandler) {
        this.handler = handler;
    }

    async subscribe(channel: string) {
        await this.redis.subscribe(channel);
    }

    async unsubscribe(channel: string) {
        await this.redis.unsubscribe(channel);
    }
}
