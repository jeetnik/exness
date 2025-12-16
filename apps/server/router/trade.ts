// import { Router ,type Request,type Response } from "express";
// import prisma from "db/client";
// import { TradeType, Status } from "../../../packages/db/generated/prisma/enums";
// export const tradeRouter=Router();

// tradeRouter.get("/",async(req:Request,res:Response)=>{
//     try{
// const {asset,type,margin,leverage}=req.body;
// const { userId, email } = req.user;
// if(!asset || !type || !margin || !leverage || (type.toUpperCase() !== "BUY" && type.toUpperCase() !== "SELL")){
//     return res.status(400).json({
//         message: "Incorrect inputs"
//     });
// }
// const userData = await prisma.user.findUnique({
//     where:{ email }
// });
// if (!userData) {
//     return res.status(404).json({
//         message: "User not found"
//     });
// }
// const userBalance = userData.balance as any;
// const tradableBalance = userBalance?.usd?.tradable || 0;
// const amount = margin * leverage;

// if(tradableBalance < margin ){
//     return res.status(402).json({
//         message: "Sorry trade can't be executed due to less balance"
//     })
// }
// //here we gernerate the random price to stimulate the actual version ,evenetuly we will get the actual prices
// const price=Math.floor(Math.random()*(5000-1000+1)+1000);
// const quantity = amount / price;
// const trade = await prisma.trade.create({
//     data: {
//         userId,
//         asset,
//         type: type.toUpperCase() as TradeType,
//         status: Status.OPEN,
//         leverage,
//         margin,
//         amount,
//         quantity
//     }
    
// });
// res.status(200).json({
//     orderId: trade.id,
//     message:"trade successfully executed"
// });} catch (e) {
//     console.error("Error while saving trade data in db", e);
//     res.status(500).json({
//         message: "Internal server error"
//     });
// }
    


// })
// tradeRouter.get("/closetrade",(req:Request,res:Response)=>{
//     try{
//         if (!req.user) {
//             return res.status(401).json({
//                 message: "Sorry you can't access the requested data"
//             });
//         }  const { userId } = req.user;

//     }catch(e){

//     }
// })
