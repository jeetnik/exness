"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    balance: number | null;
    signin: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setIsAuthenticated(true);
            refreshBalance();
        }
        setIsLoading(false);

        const handleLogout = () => {
            setIsAuthenticated(false);
            setBalance(null);
        };
        window.addEventListener('auth:logout', handleLogout);

        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const refreshBalance = async () => {
        try {
            const data = await apiClient.getBalance();
            setBalance(data.usd_balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const signin = async (email: string, password: string) => {
        const data = await apiClient.signin(email, password);
        setIsAuthenticated(true);
        await refreshBalance();
    };

    const signup = async (email: string, password: string) => {
        await apiClient.signup(email, password);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setBalance(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            balance,
            signin,
            signup,
            logout,
            refreshBalance,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
