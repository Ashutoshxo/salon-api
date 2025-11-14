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

// Connect to MongoDB
connectDB();
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🎨 Salon Campaign API',
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);  // ADD THIS
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