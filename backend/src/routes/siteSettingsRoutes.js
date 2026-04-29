import express from 'express';
import { getHeroImage, updateHeroImage } from '../controllers/siteSettingsController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /settings/hero-image — público
router.get('/hero-image', getHeroImage);

// PUT /settings/hero-image — solo admin
router.put('/hero-image', authenticateToken, requireRole(['admin']), updateHeroImage);

export default router;
