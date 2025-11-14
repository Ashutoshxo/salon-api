import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import campaignRoutes from './routes/campaign.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect DB
connectDB();

// Static files
app.use(express.static('public'));

// API Routes (IMPORTANT ORDER)
app.use('/api/auth', authRoutes);
app.use('/api', campaignRoutes);

// Root route (ONLY ONE)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎨 Salon Campaign API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      campaigns: {
        createCampaign: 'POST /api/create-campaign',
        getHistory: 'GET /api/history',
        retryCampaign: 'POST /api/retry/:id'
      }
    }
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
