
const ICThourOffset = 7;

const getResetDayIdentifier = (timestamp) => {
    if (timestamp === 0) return 'never';
    const date = new Date(timestamp);
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
};

const formatTime = (ts) => new Date(ts).toISOString().replace('T', ' ').replace('Z', ' UTC');

const testTimes = [
    new Date('2026-02-19T06:59:59+07:00').getTime(),
    new Date('2026-02-19T07:00:00+07:00').getTime(),
    new Date('2026-02-20T06:59:59+07:00').getTime(),
    new Date('2026-02-20T07:00:00+07:00').getTime(),
];

console.log("Boundary Check (07:00 ICT Reset):");
testTimes.forEach(ts => {
    console.log(`${new Date(ts).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })} (${formatTime(ts)}) -> Day ID: ${getResetDayIdentifier(ts)}`);
});
