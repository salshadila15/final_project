import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/axios';

interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'TENANT';
}

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserSession = async () => {
            setIsLoading(true);
            try {
                // Pastikan token ada sebelum manggil /auth/me
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const response = await api.get('/auth/me');
                setUser(response.data.user || response.data);
            } catch (error) {
                // Jika token invalid/expired, bersihkan localStorage
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const login = async (email: string, password: string): Promise<AuthUser> => {
        const response = await api.post('/auth/login', { email, password });
        const token = response.data.token; 
        if (token) {
            localStorage.setItem('token', token);
        }
        const userData = response.data.user || response.data; 
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token'); // 👈 Hapus token saat logout
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
}