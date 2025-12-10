import express from "express"
import { userRouter } from "./router/user";

const app=express();

app.use(express.json())
app.use("/api/v1/user",userRouter)