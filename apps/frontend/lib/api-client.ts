"use client";

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.dispatchEvent(new Event('auth:logout'));
                }
                return Promise.reject(error);
            }
        );
    }

    async signup(email: string, password: string) {
        const response = await this.client.post('/api/v1/user/signup', { email, password });
        return response.data;
    }

    async signin(email: string, password: string) {
        const response = await this.client.post('/api/v1/user/signin', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    }

    async getBalance() {
        const response = await this.client.get('/api/v1/user/balance');
        return response.data;
    }

    async createTrade(asset: string, type: 'buy' | 'sell', margin: number, leverage: number) {
        const response = await this.client.post('/api/v1/trade', {
            asset,
            type,
            margin,
            leverage,
        });
        return response.data;
    }

    async getOpenTrades() {
        const response = await this.client.get('/api/v1/trade/open');
        return response.data;
    }

    async getClosedTrades() {
        const response = await this.client.get('/api/v1/trade');
        return response.data;
    }

    async closeTrade(orderId: string) {
        const response = await this.client.post(`/api/v1/trade/close/${orderId}`);
        return response.data;
    }

    async getCandles(asset: string, ts: string, startTime: number, endTime: number) {
        const response = await this.client.get('/api/v1/candles', {
            params: { asset, ts, startTime, endTime },
        });
        return response.data;
    }

    async getChannels() {
        const response = await this.client.get('/api/v1/candles/channels');
        return response.data;
    }
}

export const apiClient = new ApiClient();
