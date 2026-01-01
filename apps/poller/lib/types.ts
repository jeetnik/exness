export interface stream {
    stream: string
    data: Ticker | DepthUpdate
}

export interface Ticker {
    E: Date
    s: string
    t: string
    p: string
    q: string
    T: Date
}

export interface DepthUpdate {
    e: string
    E: number
    s: string
    U: number
    u: number
    b: [string, string][]
    a: [string, string][]
}
export const timeframes = [
    { name: '1s', interval: '1 second' },
    { name: '1m', interval: '1 minute' },
    { name: '5m', interval: '5 minutes' },
    { name: '15m', interval: '15 minutes' },
    { name: '30m', interval: '30 minutes' },
    { name: '1H', interval: '1 hour' },
    { name: '1D', interval: '1 day' },
    { name: '1W', interval: '1 week' },
];