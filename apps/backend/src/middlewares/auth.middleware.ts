import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Perlu memperluas tipe Request bawaan Express agar bisa menyimpan data user
export interface AuthRequest extends Request {
    user?: {
        id: number | string;
        role: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN_ANDA"

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number | string; role: string };
        req.user = decoded; // Menyimpan data user ke dalam request supaya bisa dipakai di controller
        next(); // Lanjut ke controller tujuan
    } catch (error) {
        return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa' });
    }
};

// Tambahkan fungsi ini di bawah verifyToken
export const isTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'TENANT') {
        next();
    } else {
        return res.status(403).json({ message: 'Akses khusus pengelola/tenant' });
    }
};