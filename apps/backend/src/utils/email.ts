import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from 'fs';
import path from 'path';

export const sendVerificationEmail = async (email: string, token: string) => {
    try {
        const templatePath = path.join(__dirname, '../templates/verification.hbs');
        const source = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(source);
        const verificationUrl = `http://localhost:5173/verify-password?token=${token}`;

        const htmltoSend = template({ verificationUrl });

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
            port: Number(process.env.MAIL_PORT) || 2525,
            auth: {
                user: process.env.MAIL_USER || '',
                pass: process.env.MAIL_PASS || '',
            },
        });

        await transporter.sendMail({
            from: '"No Reply" <admin@app.com>',
            to: email,
            subject: 'Verification Akun & Buat Password',
            html: htmltoSend,
        });

        console.log(`Email verifikasi berhasil dikirim ke: ${email}`);
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        throw new Error('Gagal mengirim email verifikasi');
    }
};