
import { WebSocketService } from "./services/websocketServices";

const PORT = 8080;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

new WebSocketService(PORT, REDIS_URL);
