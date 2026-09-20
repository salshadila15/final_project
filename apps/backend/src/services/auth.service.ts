import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const registerService = async (
    name: string,
    email: string,
    role: string
) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email sudah terdaftar');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const newUser = await prisma.user.create({
        data: {
            name: 'Pengguna Baru',
            email,
            role: role as Role,
            verificationToken,
            tokenExpiresAt,
        }
    });

    const verificationLink = `http://localhost:5173/verify-password?token=${verificationToken}`;

    await sendVerificationEmail(email, verificationToken);

    return {
        verificationToken
    };
};

export const verifyAndSetPasswordService = async (
    token: string,
    password: string
) => {
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token
        }
    });

    if (
        !user ||
        !user.tokenExpiresAt ||
        user.tokenExpiresAt < new Date()
    ) {
        throw new Error(
            'Token tidak valid atau sudah kadaluwarsa (maks 1 jam)'
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            password: hashedPassword,
            isVerified: true,
            verificationToken: null,
            tokenExpiresAt: null
        }
    });

    return {
        message: 'Verifikasi berhasil'
    };
};

export const loginService = async (
    email: string,
    password: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user || !user.password || !user.isVerified) {
        throw new Error(
            'Email tidak ditemukan, belum verifikasi, atau password belum diatur'
        );
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error('Password salah');
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );

    return {
        token,
        role: user.role
    };
};

/**
 * Mengubah password user yang sedang login.
 */
export const changePasswordService = async (
    userId: number,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || !user.password) {
        throw new Error('User tidak ditemukan atau password belum tersedia');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isCurrentPasswordValid) {
        throw new Error('Password lama salah');
    }

    if (currentPassword === newPassword) {
        throw new Error(
            'Password baru harus berbeda dari password lama'
        );
    }

    const hashedNewPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashedNewPassword
        }
    });

    return {
        message: 'Password berhasil diubah'
    };
};