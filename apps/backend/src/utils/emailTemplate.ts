export const createVerificationEmailTemplate = (verificationLink: string) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f7;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background-color: #4f46e5;
                    color: #ffffff;
                    text-align: center;
                    padding: 24px;
                    font-size: 24px;
                    font-weight: bold;
                }
                .content {
                    padding: 30px;
                    line-height: 1.6;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .button {
                    background-color: #4f46e5;
                    color: #ffffff !important;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    display: inline-block;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    padding: 20px;
                    background-color: #f4f4f7;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    Verifikasi Akun Anda
                </div>
                <div class="content">
                    <p>Halo,</p>
                    <p>Terima kasih telah mendaftar! Untuk mulai menggunakan aplikasi, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini:</p>
                    
                    <div class="button-container">
                        <a href="${verificationLink}" class="button" target="_blank">Verifikasi Email Saya</a>
                    </div>
                    
                    <p>Atau kamu bisa salin dan tempel tautan berikut di browser:</p>
                    <p style="word-break: break-all; font-size: 12px; color: #555;">${verificationLink}</p>
                    
                    <p>Jika kamu merasa tidak mendaftarkan akun ini, abaikan saja email ini.</p>
                </div>
                <div class="footer">
                    &copy; 2026 Aplikasi Kamu. Hak Cipta Dilindungi.
                </div>
            </div>
        </body>
        </html>
    `;
};