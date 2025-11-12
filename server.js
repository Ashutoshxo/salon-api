import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import campaignRoutes from './routes/campaign.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎨 Salon Campaign API',
    version: '1.0.0',
    endpoints: {
      createCampaign: 'POST /api/create-campaign',
      getHistory: 'GET /api/history',
      retryCampaign: 'POST /api/retry/:id'
    }
  });
});

app.use('/api', campaignRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
