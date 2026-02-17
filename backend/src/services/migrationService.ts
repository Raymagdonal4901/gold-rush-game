import Rig from '../models/Rig';
import { getRigPresetId } from '../controllers/rigController';

export async function runRigTierIdMigration() {
    try {
        // Find rigs that either don't have a tierId OR are set to 9 (as they might have been incorrectly set to 9 due to the previous bug)
        const rigs = await Rig.find({
            $or: [
                { tierId: { $exists: false } },
                { tierId: 9 }
            ]
        });

        if (rigs.length === 0) return;

        console.log(`[MIGRATION] Found ${rigs.length} rigs needing tierId verification/migration.`);

        let count = 0;
        for (const rig of rigs) {
            const oldTierId = rig.tierId;
            const newTierId = getRigPresetId(rig);

            if (oldTierId !== newTierId) {
                rig.tierId = newTierId;
                await rig.save();
                count++;
            }
        }

        if (count > 0) {
            console.log(`[MIGRATION] Successfully updated ${count} rigs with correct tierId.`);
        }
    } catch (error) {
        console.error('[MIGRATION] Failed:', error);
    }
}
