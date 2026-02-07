import { Request, Response } from 'express';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import Rig from '../models/Rig';
import { AuthRequest } from '../middleware/auth';

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const messages = await ChatMessage.find()
            .sort({ timestamp: -1 })
            .limit(50);

        // Return in chronological order for the frontend
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.userId;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Level Gate: Admin or has at least one machine
        const isLevelGated = user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN';
        if (isLevelGated) {
            // Check if user owns at least one rig
            const rigCount = await Rig.countDocuments({ ownerId: user.id });
            if (rigCount <= 0) {
                return res.status(403).json({ message: 'ต้องครอบครองเครื่องขุดอย่างน้อย 1 เครื่องก่อน ถึงจะสามารถพิมพ์แชทโลกได้' });
            }
        }

        const newMessage = new ChatMessage({
            userId: user.id,
            username: user.username,
            role: user.role,
            message: message.trim(),
            isVip: (user.masteryPoints || 0) > 0 // Using masteryPoints as a proxy if vipExp is missing
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
