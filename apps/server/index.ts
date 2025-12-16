import express from "express"
import { userRouter } from "./router/user";
import { candelRouter } from "./router/candels";
const port=4000
const app=express();

app.use(express.json())
// app.use("/api/v1/user",userRouter)
app.use("/api/v1/candels",candelRouter)


app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
})