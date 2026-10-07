
import express from 'express';
import cors from 'cors'
import 'dotenv/config';
import '../src/config/db.js'

import userRoutes from './routes/userRoutes.js'
import listingRoutes from'./routes/listingRoutes.js'

const app =express();

app.use(cors());
app.use(express.json());

app.use('/api/user',userRoutes);
app.use('/api/listings',listingRoutes);

const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server is running in PORT: http://localhost:${PORT}`);
});