import mongoose from 'mongoose';

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});