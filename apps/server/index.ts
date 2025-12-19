import express from "express";
import cors from "cors";
import candlesRouter from "./router/candels";
import userRouter from "./router/user";
import tradeRouter from "./router/trade";
import assetsRouter from "./router/assets";

const port = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/trade", tradeRouter);
app.use("/api/v1/trades", tradeRouter);
app.use("/api/v1/candles", candlesRouter);
app.use("/api/v1/assets", assetsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});