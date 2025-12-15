import { Router,type Request,type Response } from "express"
import { getAllChannels, getCandles, getLatestCandle } from "../lib/helper";

export const candelRouter = Router();
candelRouter.get("/",async (req:Request,res:Response)=>{
   
    
    try {
        const { asset, startTime: startTimeParam, endTime, ts } = req.query;
        if (!asset || typeof asset !== 'string') {
            return res.status(400).json({
                error: "Asset parameter is required and must be a string"
            });
        }   
        if (!startTimeParam || typeof startTimeParam !== 'string') {
            return res.status(400).json({
                error: "startTime parameter is required and must be a unix timestamp"
            });
        }
        if (!endTime || typeof endTime !== 'string') {
            return res.status(400).json({
                error: "endTime parameter is required and must be a unix timestamp"
            });
        }
        if (!ts || typeof ts !== 'string') {
            return res.status(400).json({
                error: "ts (timeframe) parameter is required. Supported: 1s, 1m, 5m, 15m, 30m, 1h, 1d, 1w"
            });
        }
        const startTimestamp = parseInt(startTimeParam);
        const endTimestamp = parseInt(endTime);

        if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
            return res.status(400).json({
                error: "startTime and endTime must be valid unix timestamps"
            });
        }

        if (startTimestamp >= endTimestamp) {
            return res.status(400).json({
                error: "startTime must be less than endTime"
            });
        }

        const timeDiff = endTimestamp - startTimestamp;
        const maxTimeRange = {
            '1s': 24 * 60 * 60, // 1 day for 1s candles
            '1m': 30 * 24 * 60 * 60, // 30 days for 1m candles
            '5m': 90 * 24 * 60 * 60, // 90 days for 5m candles
            '15m': 180 * 24 * 60 * 60, // 180 days for 15m candles
            '30m': 365 * 24 * 60 * 60, // 1 year for 30m candles
            '1h': 2 * 365 * 24 * 60 * 60, // 2 years for 1h candles
            '1H': 2 * 365 * 24 * 60 * 60, // 2 years for 1H candles
            '1d': 5 * 365 * 24 * 60 * 60, // 5 years for 1d candles
            '1D': 5 * 365 * 24 * 60 * 60, // 5 years for 1D candles
            '1w': 10 * 365 * 24 * 60 * 60, // 10 years for 1w candles
            '1W': 10 * 365 * 24 * 60 * 60, // 10 years for 1W candles
        };

        const maxRange = maxTimeRange[ts as keyof typeof maxTimeRange];
        if (maxRange && timeDiff > maxRange) {
            return res.status(400).json({
                error: `Time range too large for ${ts} timeframe. Maximum allowed: ${Math.floor(maxRange / (24 * 60 * 60))} days`
            });
        }

        const candles = await getCandles({
            asset: asset.toUpperCase(),
            startTime: startTimestamp,
            endTime: endTimestamp,
            timeframe: ts
        });

        res.status(200).json({
            candles
        });

    } catch (error) {
        console.error('Error fetching candles:', error);
        res.status(500).json({
            error: "Internal server error while fetching candles"
        });
    }

})
candelRouter.get("/channels",async (req:Request,res:Response)=>{
    try{
        const channels=await getAllChannels();

        res.status(200).json({
            channels,
            count:channels.length
        })
    }catch(e){

        res.status(500).json({
            error: "Internal server error while fetching symbols"
        });

    }

})
candelRouter.get("/latest",async (req:Request,res:Response)=>{
    try{
        const {asset,ts='1m'}=req.query;
        if(!asset||typeof asset!=='string'){
            return res.status(400).json({
                error: "Asset parameter is required"
            });
        }
        const latestCandle = await getLatestCandle(asset.toUpperCase(), ts as string);
        if(!latestCandle){
            return res.status(404).json({
                  error: `No candle data found for ${asset}`
            })
        }

        res.status(200).json({
            candle: latestCandle
        });
    }catch(e){
        res.status(500).json({
            error: "Internal server error while fetching latest candle"
        });
    }
    
})