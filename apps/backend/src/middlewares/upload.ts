import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
});

export const paymentUpload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Bukti pembayaran harus berupa JPG atau PNG'));
      return;
    }

    cb(null, true);
  },
});