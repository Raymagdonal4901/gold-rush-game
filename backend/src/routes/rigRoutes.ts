import express from 'express';
import {
    getMyRigs,
    buyRig,
    claimRigProfit,
    refillRigEnergy,
    collectMaterials,
    claimRigGift,
    equipAccessory,
    unequipAccessory,
    repairRig,
    destroyRig,
    craftRig
} from '../controllers/rigController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getMyRigs);
router.post('/buy', authenticate, buyRig);
router.post('/craft', authenticate, craftRig);
router.post('/:id/refill', authenticate, refillRigEnergy);
router.post('/:id/claim', authenticate, claimRigProfit);
router.post('/:id/collect', authenticate, collectMaterials);
router.post('/:id/gift', authenticate, claimRigGift);
router.post('/:id/equip', authenticate, equipAccessory);
router.post('/:id/unequip', authenticate, unequipAccessory);
router.post('/:id/repair', authenticate, repairRig);
router.post('/:id/destroy', authenticate, destroyRig);

export default router;
