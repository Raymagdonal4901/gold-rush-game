
import express from 'express';
import { playLuckyDraw } from '../controllers/luckyDrawController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/play', authenticate, playLuckyDraw);

export default router;
