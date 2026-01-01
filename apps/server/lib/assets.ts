import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.TIMESCALE_URL
});

interface AssetData {
    name: string;
    symbol: string;
    buyPrice: number;
    sellPrice: number;
    decimals: number;
    imageUrl: string;
}

const assetMetadata: { [key: string]: { name: string; imageUrl: string } } = {
    'BTC': {
        name: 'Bitcoin',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC--big.svg'
    },
    'ETH': {
        name: 'Ethereum',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH--big.svg'
    },
    'SOL': {
        name: 'Solana',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL--big.svg'
    },
    'XRP': {
        name: 'Ripple',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP--big.svg'
    },
    'MATIC': {
        name: 'Polygon',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCMATIC--big.svg'
    },
    'AVAX': {
        name: 'Avalanche',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCAVAX--big.svg'
    },
    'DOT': {
        name: 'Polkadot',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOT--big.svg'
    },
    'LINK': {
        name: 'Chainlink',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCLINK--big.svg'
    },
    'UNI': {
        name: 'Uniswap',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCUNI--big.svg'
    },
    'ATOM': {
        name: 'Cosmos',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCATOM--big.svg'
    },
    'ADA': {
        name: 'Cardano',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCADA--big.svg'
    },
    'DOGE': {
        name: 'Dogecoin',
        imageUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOGE--big.svg'
    }
};

const getAvailableChannels = async (): Promise<string[]> => {
    const client = await pool.connect();

    try {
        const query = `
            SELECT DISTINCT channel 
            FROM trades_1m 
            ORDER BY channel;
        `;

        const result = await client.query(query);
        return result.rows.map((row: any) => row.channel);

    } catch (error) {
        console.error('Error fetching available channels:', error);
        return [];
    } finally {
        client.release();
    }
};

const getLatestPrices = async (): Promise<{ [channel: string]: number }> => {
    const client = await pool.connect();

    try {
        const query = `
            SELECT DISTINCT ON (channel) 
                channel,
                close as price
            FROM trades_1m
            WHERE bucket >= NOW() - INTERVAL '24 hours'
            ORDER BY channel, bucket DESC;
        `;

        const result = await client.query(query);
        const prices: { [channel: string]: number } = {};

        result.rows.forEach((row: any) => {
            prices[row.channel.toUpperCase()] = parseFloat(row.price);
        });

        return prices;

    } catch (error) {
        console.error('Error fetching latest prices:', error);
        return {};
    } finally {
        client.release();
    }
};

const calculatePrices = (marketPrice: number, spreadPercent: number = 0.1): { buyPrice: number; sellPrice: number } => {
    const spread = marketPrice * (spreadPercent / 100);
    return {
        buyPrice: Math.floor((marketPrice + spread) * 10000),
        sellPrice: Math.floor((marketPrice - spread) * 10000)
    };
};

export const getAssets = async (): Promise<AssetData[]> => {
    try {
        const channels = await getAvailableChannels();
        const latestPrices = await getLatestPrices();
        
        const assets: AssetData[] = [];

        channels.forEach(channel => {
            const marketPrice = latestPrices[channel.toUpperCase()];

            if (!marketPrice || marketPrice === 0) {
                console.warn(`No price found for asset: ${channel}`);
                return;
            }

            const { buyPrice, sellPrice } = calculatePrices(marketPrice);

            const metadata = assetMetadata[channel.toUpperCase()] || {
                name: channel,
                imageUrl: `https://via.placeholder.com/32x32.png?text=${channel}`
            };

            assets.push({
                name: metadata.name,
                symbol: channel.toUpperCase(),
                buyPrice,
                sellPrice,
                decimals: 4,
                imageUrl: metadata.imageUrl
            });
        });

        return assets.sort((a, b) => a.symbol.localeCompare(b.symbol));

    } catch (error) {
        console.error('Error getting assets:', error);
        throw error;
    }
};

export const getAssetBySymbol = async (symbol: string): Promise<AssetData | null> => {
    try {
        const assets = await getAssets();
        return assets.find(asset => asset.symbol.toUpperCase() === symbol.toUpperCase()) || null;
    } catch (error) {
        console.error(`Error getting asset ${symbol}:`, error);
        throw error;
    }
};








