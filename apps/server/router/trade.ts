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

        const trades = await Promise.all(openTrades.map(async (trade) => {
            const latestCandle = await getLatestCandle(trade.asset);
            const currentPrice = latestCandle?.close || trade.openPrice;

            let unrealizedPnl = 0;
            if (trade.type === TradeType.BUY) {
                unrealizedPnl = ((currentPrice - trade.openPrice) / trade.openPrice) * trade.amount;
            } else {
                unrealizedPnl = ((trade.openPrice - currentPrice) / trade.openPrice) * trade.amount;
            }

            return {
                orderId: trade.id,
                asset: trade.asset,
                type: trade.type.toLowerCase(),
                margin: Math.floor(trade.margin * 100),
                leverage: trade.leverage,
                openPrice: Math.floor(trade.openPrice),
                currentPrice: Math.floor(currentPrice),
                unrealizedPnl: Math.floor(unrealizedPnl * 100)
            };
        }));

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

router.post("/close/:orderId", usermiddleware, async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userPayload = req.user;

        if (!userPayload || !userPayload.userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const trade = await prisma.trade.findUnique({
            where: { id: orderId }
        });

        if (!trade) {
            return res.status(404).json({
                message: "Trade not found"
            });
        }

        if (trade.userId !== userPayload.userId) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        if (trade.status !== Status.OPEN) {
            return res.status(400).json({
                message: "Trade is already closed"
            });
        }

        const latestCandle = await getLatestCandle(trade.asset);
        if (!latestCandle) {
            return res.status(404).json({
                message: "Unable to fetch current price"
            });
        }

        const closePrice = latestCandle.close;

        let pnl = 0;
        if (trade.type === TradeType.BUY) {
            pnl = ((closePrice - trade.openPrice) / trade.openPrice) * trade.amount;
        } else {
            pnl = ((trade.openPrice - closePrice) / trade.openPrice) * trade.amount;
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

        const newTradableBalance = userBalance.usd.tradable + trade.margin + pnl;
        const newLockedBalance = userBalance.usd.locked - trade.margin;

        const newBalance = {
            usd: {
                tradable: newTradableBalance,
                locked: newLockedBalance
            }
        };

        const [updatedTrade] = await prisma.$transaction([
            prisma.trade.update({
                where: { id: orderId },
                data: {
                    status: Status.CLOSED,
                    closePrice,
                    pnl
                }
            }),
            prisma.user.update({
                where: { id: userPayload.userId },
                data: { balance: newBalance }
            })
        ]);

        res.status(200).json({
            message: "Position closed successfully",
            pnl: Math.floor(pnl * 100),
            closePrice: Math.floor(closePrice)
        });

    } catch (e) {
        console.error("Error closing trade:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

export default router;
