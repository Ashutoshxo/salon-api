// // // routes/campaign.routes.js
// // import express from 'express';
// // import multer from 'multer';
// // import * as campaignController from '../controllers/campaign.controller.js';
// // import { validateCampaign } from '../middleware/validation.js';

// // const router = express.Router();

// // // Multer configuration for voice file upload
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/');
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, `voice-${Date.now()}-${file.originalname}`);
// //   }
// // });

// // const upload = multer({ 
// //   storage,
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype.startsWith('audio/')) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only audio files are allowed'));
// //     }
// //   }
// // });

// // // Routes
// // router.post('/create-campaign', upload.single('voiceFile'), validateCampaign, campaignController.createCampaign);
// // router.get('/history', campaignController.getHistory);
// // router.post('/retry/:id', campaignController.retryCampaign);

// // // Export router as default for ES module import
// // export default router;

// import express from 'express';
// import multer from 'multer';
// import { createCampaign, getHistory, retryCampaign } from '../controllers/campaign.controller.js';
// import { optionalAuth } from '../middleware/auth.js';

// const router = express.Router();

// // File upload config
// const upload = multer({ 
//   dest: 'uploads/',
//   limits: { 
//     fileSize: 10 * 1024 * 1024 // 10MB
//   }
// });

// // Routes
// router.post(
//   '/create-campaign',
//   optionalAuth,
//   upload.fields([
//     { name: 'audioFile', maxCount: 1 },
//     { name: 'logoFile', maxCount: 1 }
//   ]),
//   createCampaign
// );

// router.get('/history', optionalAuth, getHistory);
// router.post('/retry/:id', optionalAuth, retryCampaign);

// export default router;
import express from 'express';
import multer from 'multer';
import { createCampaign, getHistory, retryCampaign } from '../controllers/campaign.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files for audioFile
    if (file.fieldname === 'audioFile') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audioFile'));
      }
    }
    // Accept images for logoFile
    else if (file.fieldname === 'logoFile') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for logoFile'));
      }
    }
    else {
      cb(null, true);
    }
  }
});

// Routes with optional authentication
router.post(
  '/create-campaign',
  optionalAuth,
  upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'logoFile', maxCount: 1 }
  ]),
  createCampaign
);

router.get('/history', optionalAuth, getHistory);

router.post('/retry/:id', optionalAuth, retryCampaign);

export default router;