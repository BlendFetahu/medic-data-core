import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Rëndësishme: Kjo duhet të jetë rreshti i parë
app.use(express.json()); 

// Ky rresht shton automatikisht "/auth" para çdo rruge në auth.js
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5001; // Sigurohu që është 5001 për Docker
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});