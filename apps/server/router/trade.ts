import { Router, type Request, type Response } from "express";
import prisma from "db/client";
import{ TradeType, Status } from "db/client";
import { usermiddleware } from "../middleware";
import { getLatestCandle } from "../lib/helper";

const router = Router();

router.post("/", usermiddleware, async (req: Request, res: Response) => {
    try {
        const { asset, type, margin, leverage } = req.body;
        const userPayload = req.user;

        if (!userPayload || !userPayload.userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!asset || !type || !margin || !leverage || (type.toUpperCase() !== "BUY" && type.toUpperCase() !== "SELL")) {
            return res.status(411).json({
                message: "Incorrect inputs"
            });
        }

        if (typeof margin !== 'number' || typeof leverage !== 'number' || margin <= 0 || leverage <= 0) {
            return res.status(411).json({
                message: "Incorrect inputs"
            });
        }

        const userData = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });

        if (!userData) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const userBalance = typeof userData.balance === 'string' 
            ? JSON.parse(userData.balance) 
            : userData.balance;
        const tradableBalance = userBalance?.usd?.tradable || 0;
        const marginInUsd = margin / 100;

        if (tradableBalance < marginInUsd) {
            return res.status(402).json({
                message: "Insufficient balance"
            });
        }

        const latestCandle = await getLatestCandle(asset.toUpperCase());
        if (!latestCandle) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        const openPrice = latestCandle.close;
        const amount = marginInUsd * leverage;
        const quantity = amount / (openPrice / 10000);

        const newBalance = {
            usd: {
                tradable: tradableBalance - marginInUsd,
                locked: (userBalance?.usd?.locked || 0) + marginInUsd
            }
        };

        const [trade] = await prisma.$transaction([
            prisma.trade.create({
                data: {
                    userId: userPayload.userId,
                    asset: asset.toUpperCase(),
                    type: type.toUpperCase() as TradeType,
                    status: Status.OPEN,
                    leverage,
                    margin: marginInUsd,
                    amount,
                    quantity,
                    openPrice: openPrice
                }
            }),
            prisma.user.update({
                where: { id: userPayload.userId },
                data: { balance: newBalance }
            })
        ]);

        res.status(200).json({
            orderId: trade.id
        });
    } catch (e) {
        console.error("Error while creating trade:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/open", usermiddleware, async (req: Request, res: Response) => {
    try {
        const userPayload = req.user;

        if (!userPayload || !userPayload.userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const openTrades = await prisma.trade.findMany({
            where: {
                userId: userPayload.userId,
                status: Status.OPEN
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const trades = openTrades.map((trade) => {
            return {
                orderId: trade.id,
                type: trade.type.toLowerCase(),
                margin: Math.floor(trade.margin * 100),
                leverage: trade.leverage,
                openPrice: Math.floor(trade.openPrice)
            };
        });

        res.status(200).json({
            trades
        });
    } catch (e) {
        console.error("Error fetching open trades:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/", usermiddleware, async (req: Request, res: Response) => {
    try {
        const userPayload = req.user;

        if (!userPayload || !userPayload.userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const closedTrades = await prisma.trade.findMany({
            where: {
                userId: userPayload.userId,
                status: Status.CLOSED
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const trades = closedTrades.map((trade) => {
            return {
                orderId: trade.id,
                type: trade.type.toLowerCase(),
                margin: Math.floor(trade.margin * 100),
                leverage: trade.leverage,
                openPrice: Math.floor(trade.openPrice),
                closePrice: Math.floor(trade.closePrice),
                pnl: Math.floor(trade.pnl * 100)
            };
        });

        res.status(200).json({
            trades
        });
    } catch (e) {
        console.error("Error fetching closed trades:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

export default router;
