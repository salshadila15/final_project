import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// 1. Service Register (Tanpa Password, Generate Token 1 Jam, Fleksibel Role Case)
export const registerService = async (email: string, role: string) => {
    const existingUser = await prisma.user.findUnique({ where: {email } });
    if (existingUser) {
        throw new Error('Email sudah terdaftar');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const newUser = await prisma.user.create({
        data: {
            email,
            role: role as Role,
            verificationToken,
            tokenExpiresAt
        }
    });

    const verificationLink = 'http://localhost:5173/verify-password?token=${verificationToken}';

    await sendVerificationEmail(email, verificationToken);

    return { verificationToken };
};

// 2. Service Verifikasi & Set Password
export const verifyAndSetPasswordService = async (token: string, password: string) => {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });

    if (!user || !user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
        throw new Error('Token tidak valid atau sudah kadaluwarsa (maks 1 jam)');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, isVerified: true, verificationToken: null, tokenExpiresAt: null }
    });

    return { message: 'Verifikasi berhasil' };
};

// 3. Service Login
export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !user.isVerified) {
        throw new Error('Email tidak ditemukan, belum verifikasi, atau password belum diatur');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Password salah');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return { token, role: user.role };
};