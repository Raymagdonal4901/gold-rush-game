import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MinesGame from '../models/MinesGame';
import User from '../models/User';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Helper: Calculate multiplier for the next reveal
 * Multiplier = (TotalTiles / (TotalTiles - Mines)) * HouseEdge
 */
const calculateMultiplier = (minesCount: number, revealedCount: number) => {
    const totalTiles = 25;
    const houseEdge = 0.90; // 10% House Edge

    // probability of picking a safe tile = (Total Safe - Revealed) / (Total - Revealed)
    // 1 / probability = (Total - Revealed) / (Total Safe - Revealed)
    const totalSafe = totalTiles - minesCount;
    const multiplierIncrease = (totalTiles - revealedCount) / (totalSafe - revealedCount);

    return multiplierIncrease * houseEdge;
};

export const startGame = async (req: AuthRequest, res: Response) => {
    try {
        const { betAmount, minesCount } = req.body;
        const userId = req.userId;

        if (!betAmount || betAmount <= 0) {
            return res.status(400).json({ message: 'Invalid bet amount' });
        }

        if (!minesCount || minesCount < 1 || minesCount > 24) {
            return res.status(400).json({ message: 'Invalid mines count (1-24)' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < betAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Check for existing active game
        const existingGame = await MinesGame.findOne({ userId, status: 'ACTIVE' });
        if (existingGame) {
            return res.status(400).json({ message: 'You already have an active game', game: existingGame });
        }

        // Secure RNG for Mines
        const minesSet = new Set<number>();
        while (minesSet.size < minesCount) {
            minesSet.add(crypto.randomInt(0, 25));
        }

        // Create Game
        const game = new MinesGame({
            userId,
            betAmount,
            minesCount,
            mines: Array.from(minesSet),
            status: 'ACTIVE',
            currentMultiplier: 1.0,
            potentialWin: betAmount
        });

        // Deduct Balance Immediately
        user.balance -= betAmount;

        await Promise.all([
            user.save(),
            game.save(),
            Transaction.create({
                userId,
                type: 'SYSTEM_ADJUSTMENT',
                amount: -betAmount,
                description: `ลงเดิมพันเกม Mines (${minesCount} ระเบิด)`,
                status: 'COMPLETED'
            })
        ]);

        const gameResponse = game.toObject() as any;
        delete gameResponse.mines;

        res.status(201).json({
            message: 'Game started',
            gameId: game._id,
            initialState: gameResponse,
            newBalance: user.balance
        });
    } catch (error) {
        console.error('[MINES START ERROR]', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const revealTile = async (req: AuthRequest, res: Response) => {
    try {
        const { tileIndex, gameId } = req.body;
        const userId = req.userId;

        const effectiveGameId = gameId || req.body.id;
        const game = await MinesGame.findOne({ _id: effectiveGameId, userId }).select('+mines');

        if (!game) return res.status(404).json({ message: 'Game not found' });
        if (game.status !== 'ACTIVE') return res.status(400).json({ message: 'Game is not active' });
        if (tileIndex < 0 || tileIndex > 24) return res.status(400).json({ message: 'Invalid tile index' });
        if (game.revealed.includes(tileIndex)) return res.status(400).json({ message: 'Tile already revealed' });

        // CASE A: BOMB 💣
        if (game.mines.includes(tileIndex)) {
            game.status = 'EXPLODED';
            game.potentialWin = 0;

            await Promise.all([
                game.save(),
                Transaction.create({
                    userId,
                    type: 'GAME_LOSS',
                    amount: game.betAmount,
                    description: `เสียพนันเกม Mines (${game.minesCount} ระเบิด)`,
                    status: 'COMPLETED'
                })
            ]);

            return res.json({
                status: 'GAME_OVER',
                mines: game.mines,
                message: 'BOOM! You hit a mine.'
            });
        }

        // CASE B: GEM 💎
        const multiplierIncrease = calculateMultiplier(game.minesCount, game.revealed.length);

        // Cap Multiplier at x50
        game.currentMultiplier = Math.min(50.0, game.currentMultiplier * multiplierIncrease);
        game.potentialWin = Math.floor(game.betAmount * game.currentMultiplier * 100) / 100;
        game.revealed.push(tileIndex);

        await game.save();

        res.json({
            status: 'SAFE',
            multiplier: game.currentMultiplier,
            payout: game.potentialWin,
            revealed: game.revealed
        });
    } catch (error) {
        console.error('[MINES REVEAL ERROR]', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const cashOut = async (req: AuthRequest, res: Response) => {
    try {
        const { gameId } = req.body;
        const userId = req.userId;

        const effectiveGameId = gameId || req.body.id;
        const game = await MinesGame.findOne({ _id: effectiveGameId, userId }).select('+mines');

        if (!game) return res.status(404).json({ message: 'Game not found' });
        if (game.status !== 'ACTIVE') return res.status(400).json({ message: 'Game is not active' });

        // Minimum Moves Rule
        const revealedCount = game.revealed.length;
        let minRequired = 1;
        if (game.minesCount >= 1 && game.minesCount <= 5) {
            minRequired = 3;
        } else if (game.minesCount >= 6 && game.minesCount <= 15) {
            minRequired = 2;
        }

        if (revealedCount < minRequired) {
            return res.status(400).json({ message: `You need to reveal more tiles! (${revealedCount}/${minRequired})` });
        }

        const winAmount = game.potentialWin;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update Game
        game.status = 'CASHED_OUT';

        // Update User Balance & Create Transaction
        user.balance += winAmount;

        await Promise.all([
            user.save(),
            game.save(),
            Transaction.create({
                userId,
                type: 'SYSTEM_ADJUSTMENT',
                amount: winAmount,
                description: `ถอนเงินจากเกม Mines (${game.currentMultiplier.toFixed(2)}x)`,
                status: 'COMPLETED'
            })
        ]);

        res.json({
            status: 'WIN',
            finalPayout: winAmount,
            newBalance: user.balance,
            mines: game.mines
        });
    } catch (error) {
        console.error('[MINES CASHOUT ERROR]', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getActiveGame = async (req: AuthRequest, res: Response) => {
    try {
        const game = await MinesGame.findOne({ userId: req.userId, status: 'ACTIVE' });
        res.json(game || null);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
