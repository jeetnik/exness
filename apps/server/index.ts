import express from "express";
import cors from "cors";
import candlesRouter from "./router/candels";
import userRouter from "./router/user";
import tradeRouter from "./router/trade";
import assetsRouter from "./router/assets";
import marketRouter from "./router/market";

const port = process.env.PORT || 4000;
const app = express();

// CORS configuration - allow frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'||'http://localhost:3001',
    credentials: true
}));
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/trade", tradeRouter);
app.use("/api/v1/trades", tradeRouter);
app.use("/api/v1/candles", candlesRouter);
app.use("/api/v1/assets", assetsRouter);
app.use("/api/v1/market", marketRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});