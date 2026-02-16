import express from 'express';
import { authenticate } from '../middleware/auth';
import * as minesController from '../controllers/minesController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/start', minesController.startGame);
router.post('/reveal', minesController.revealTile);
router.post('/cashout', minesController.cashOut);
router.get('/active', minesController.getActiveGame);

export default router;
