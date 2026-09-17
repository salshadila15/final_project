import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<AuthUser> => {
        const response = await api.post('/auth/login', { email, password });
        
        // Sesuaikan jika data user di backend kamu posisinya berbeda (misal: response.data)
        const token = response.data.token;
        const userData = response.data.user || response.data; 

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
    return context;
}