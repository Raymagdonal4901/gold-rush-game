import express from 'express';
import { authenticate } from '../middleware/auth';
import { getChatMessages, sendChatMessage } from '../controllers/chatController';

const router = express.Router();

// Publicly readable messages
router.get('/', getChatMessages);

// Protected sending
router.post('/', authenticate, sendChatMessage);

export default router;
