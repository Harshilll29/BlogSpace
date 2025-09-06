import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export const uploadBanner = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
};

export const uploadBlogImage = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
};

export const serveMedia = async (req, res) => {
    try {
        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        const stream = bucket.openDownloadStreamByName(req.params.filename);
        stream.on('error', () => res.status(404).send('Not found'));
        stream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};