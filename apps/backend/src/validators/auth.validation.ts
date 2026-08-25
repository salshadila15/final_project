import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid" }),

    role: z.string()
        .transform((val) => val.toLowerCase())
        .refine((val) => val === 'user' || val === 'tenant', {
            message: "Role tidak valid. Harus 'user' atau 'tenant'"
        })
        .transform((val) => val.toUpperCase()),
});

export const verifyPasswordSchema = z.object({
    token: z.string({ message: "Token wajib diisi" }),
    password: z.string().min(6, { message: "Password minimal harus 6 karakter" }),
});