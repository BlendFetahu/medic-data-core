import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ Shto këtë rresht
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// ✅ CORS duhet të jetë gjithmonë para rrugëve (routes)
app.use(cors()); 
app.use(express.json()); 

// Rrugët e autentikimit
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✅ Auth Service running on port ${PORT}`);
});