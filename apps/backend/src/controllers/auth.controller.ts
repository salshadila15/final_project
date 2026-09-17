import { Request, Response } from 'express';
import { registerService, verifyAndSetPasswordService, loginService } from '../services/auth.service';
import { registerSchema } from '../validators/auth.validation';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        const errorMessages = validation.error.issues.map((err) => err.message);

        res.status(400).json({
            message: "Validasi gagal",
            errors: errorMessages
        });
        return;
    }

    try {
        const { name, email, role } = validation.data;
        const result = await registerService(name, email, role);

        res.status(201).json({
            message: 'Register berhasil. Silakan cek email untuk verifikasi.',
            debugToken: result.verificationToken
        });
    } catch (error: any) {
        res.status(400).json({message: error.message });
    }
};

    export const verifyAndSetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.body.token || req.query.token;
            const password = req.body.password;

            if (!token) {
                res.status(400).json({ message: "Token tidak ditemukan"});
            }

            if (!password) {
                res.status(200).json({
                    message: "Token valid. Silakan masukkan password baru melalui aplikasi/postman",
                    token: token
                });
                return;
            }

            const result = await verifyAndSetPasswordService(token as string, password);
            res.status(200).json(result);
            
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
        };

    export const getProfileController = async (req: AuthRequest, res: Response) => {
        try {
            // req.user didapatkan dari satpam middleware (verifyToken) yang membawa data id & role
            const userId = req.user?.id;

            // Bisa ambil data lengkapnya dari database pakai prisma
            // const user = await prisma.user.findUnique({ where: { id: userId } });

            return res.status(200).json({
                message: 'Berhasil mengakses rute privat',
                userId: req.user // Menampilkan payload token (id & role)
            });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    export const login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await loginService(email, password);

            res.status(200).json({ message: 'Login berhasil', ...result });
        } catch (error: any) {
            res.status(400).json ({ message: error.message });
        }
        };
    
    export const logout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            });

        res.status(200).json({ message: 'Logout berhasil' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        }
    };

    export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            const user = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { id: true, email: true, name: true, role: true },
            });

            if (!user) {
                res.status(404).json({ message: 'User tidak ditemukan' });
                return;
            }

            res.status(200).json({ user });
            return;
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
    };
    