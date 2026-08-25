import nodemailer from "nodemailer";

console.log("DEBUG EMAIL - USER:", JSON.stringify(process.env.MAIL_USER));
console.log("DEBUG EMAIL - PASS:", JSON.stringify(process.env.MAIL_PASS));

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});