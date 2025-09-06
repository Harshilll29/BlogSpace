import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

// GridFS storage setup
const storage = new GridFsStorage({
    url: process.env.DB_LOCATION,
    file: (req, file) => ({
        filename: Date.now() + '-' + file.originalname,
        bucketName: 'uploads',
    }),
});

export const upload = multer({ storage });