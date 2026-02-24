import { DAILY_CHECKIN_REWARDS } from './src/constants';

console.log('Verifying DAILY_CHECKIN_REWARDS...');
const day7 = DAILY_CHECKIN_REWARDS.find(r => r.day === 7);
if (day7 && day7.amount === 3) {
    console.log('SUCCESS: Day 7 reward amount is 3.');
} else {
    console.log('FAILURE: Day 7 reward amount is not 3 or not found.', day7);
}

const day14 = DAILY_CHECKIN_REWARDS.find(r => r.day === 14);
console.log('Day 14 reward:', day14);

process.exit(0);
