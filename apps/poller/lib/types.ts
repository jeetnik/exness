export interface stream {
    stream: string
    data: Ticker
}

export interface Ticker {
    E: number
    s: string
    t: number
    p: string
    q: string
    T: number
}