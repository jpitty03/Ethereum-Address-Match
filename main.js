import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config();

import { generateIdentitiesAndWriteToFile } from './utils/generateIds.js';

// Load version from package.json
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version || 'v1.0.0';

// Load records per loop from .env
const recordsPerLoop = process.env.RECORDS || 10000;

let x = 0;
const maxRuns = 2; // Number of loops
const tempFile = 'riches/temp.json';
const richesFiles = 'riches.json';
const loopTimes = [];

// Establish database connection
const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

console.log('Connecting to database...');
await connection.connect();

while (x < maxRuns || maxRuns === -1) {
    const loopStart = new Date();
    try {
        await generateIdentitiesAndWriteToFile(tempFile);

        const tempData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
        const addressesToMatch = tempData.map(item => item.address);

        async function matchAddresses() {
            try {
                const placeholders = addressesToMatch.map(() => '?').join(',');
                const query = `SELECT * FROM wallets WHERE address IN (${placeholders})`;
                const [rows] = await connection.execute(query, addressesToMatch);

                const mergedRows = rows.map(row => {
                    const tempObject = tempData.find(item => item.address === row.address);
                    return { ...row, privateKey: tempObject.privateKey };
                });

                const jsonString = JSON.stringify(mergedRows, null, 2);
                fs.appendFileSync(richesFiles, jsonString);
                console.log('Matches with privateKey appended to riches.json');
            } catch (error) {
                console.error('Error:', error);
            }
        }
        await matchAddresses();
    } catch (error) {
        console.error('An error occurred:', error);
    }

    const loopEnd = new Date();
    const loopTime = (loopEnd - loopStart) / 1000;
    loopTimes.push(loopTime);

    x++;
    console.log(`Number of records processed: ${x * recordsPerLoop}`);
    console.log(`Loop ${x} took ${loopTime.toFixed(2)} seconds.`);
}

const averageTime = loopTimes.reduce((a, b) => a + b, 0) / loopTimes.length;
console.log(`Average loop time: ${averageTime.toFixed(2)} seconds.`);

// Generate Shields.io badge URLs
const badgeAverageTime = `https://img.shields.io/badge/average_loop_time-${averageTime.toFixed(2)}s-brightgreen`;
const badgeVersion = `https://img.shields.io/badge/release-${version}-blue`;
const badgeRecords = `https://img.shields.io/badge/records_per_loop-${recordsPerLoop}-orange`;

// Read README.md
const readmeFilePath = 'README.md';
let readmeContent = fs.existsSync(readmeFilePath)
    ? fs.readFileSync(readmeFilePath, 'utf8')
    : '';

// Replace or add badges
readmeContent = readmeContent.replace(
    /!\[Average Loop Time\]\(.*?\)/,
    `![Average Loop Time](${badgeAverageTime})`
);
readmeContent = readmeContent.replace(
    /!\[Release Version\]\(.*?\)/,
    `![Release Version](${badgeVersion})`
);
readmeContent = readmeContent.replace(
    /!\[Records Per Loop\]\(.*?\)/,
    `![Records Per Loop](${badgeRecords})`
);

// If badges don't exist, append them
if (!readmeContent.includes('![Average Loop Time]')) {
    readmeContent += `\n![Average Loop Time](${badgeAverageTime})`;
}
if (!readmeContent.includes('![Release Version]')) {
    readmeContent += `\n![Release Version](${badgeVersion})`;
}
if (!readmeContent.includes('![Records Per Loop]')) {
    readmeContent += `\n![Records Per Loop](${badgeRecords})`;
}

// Write updated README.md
fs.writeFileSync(readmeFilePath, readmeContent);
console.log('README.md updated with the new badges.');

console.log('Closing the database connection...');
await connection.end();
