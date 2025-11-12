// routes/campaign.routes.js
import express from 'express';
import multer from 'multer';
import * as campaignController from '../controllers/campaign.controller.js';
import { validateCampaign } from '../middleware/validation.js';

const router = express.Router();

// Multer configuration for voice file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `voice-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Routes
router.post('/create-campaign', upload.single('voiceFile'), validateCampaign, campaignController.createCampaign);
router.get('/history', campaignController.getHistory);
router.post('/retry/:id', campaignController.retryCampaign);

// Export router as default for ES module import
export default router;
