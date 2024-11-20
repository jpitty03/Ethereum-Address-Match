import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import { generateIdentitiesAndWriteToFile } from './utils/generateIds.js';

let x = 0;
const maxRuns = 1000; // Set to -1 to run continuously
const tempFile = 'riches/temp.json';
const richesFiles = 'riches/riches.json';
const loopTimes = [];

const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

console.log('Connecting to database...');
await connection.connect();

while (x < maxRuns || maxRuns === -1) {
    const loopStart = new Date(); // Declare loopStart at the beginning of each iteration
    try {
        await generateIdentitiesAndWriteToFile(tempFile);

        // Read the contents of temp.json and extract addresses
        const tempData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
        const addressesToMatch = tempData.map(item => item.address);

        // Function to match addresses in temp.json with addresses
        async function matchAddresses() {
            try {
                // Prepare the SQL query to find matches
                const placeholders = addressesToMatch.map(() => '?').join(',');
                const query = `SELECT * FROM wallets WHERE address IN (${placeholders})`;
                const [rows] = await connection.execute(query, addressesToMatch);

                // Merge privateKey information from temp.json with matched rows
                const mergedRows = rows.map(row => {
                    const tempObject = tempData.find(item => item.address === row.address);
                    return { ...row, privateKey: tempObject.privateKey };
                });

                // Write the matched rows with privateKey to riches.json
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

    const loopEnd = new Date(); // Declare loopEnd after the iteration completes
    const loopTime = (loopEnd - loopStart) / 1000; // Calculate loop time in seconds
    loopTimes.push(loopTime);

    x++;
    console.log('Number of records processed: ' + x * 10000);
    console.log(`Loop ${x} took ${loopTime.toFixed(2)} seconds.`);
}

// Calculate average loop time
const averageTime = loopTimes.reduce((a, b) => a + b, 0) / loopTimes.length;
console.log(`Average loop time: ${averageTime.toFixed(2)} seconds.`);

// Generate Shields.io badge URL
const badgeURL = `https://img.shields.io/badge/average_loop_time-${averageTime.toFixed(2)}s-brightgreen`;

const readmeFilePath = 'README.md'; // Ensure this path is correct
const badgeSection = `
## Average Loop Time
![Average Loop Time](${badgeURL})

This badge displays the average time it takes for each loop in the script to run.
`;

let readmeContent = '';
if (fs.existsSync(readmeFilePath)) {
    readmeContent = fs.readFileSync(readmeFilePath, 'utf8');
}

// Check if badge already exists
if (readmeContent.includes('![Average Loop Time]')) {
    // Replace existing badge
    readmeContent = readmeContent.replace(/!\[Average Loop Time\]\(.*?\)/, `![Average Loop Time](${badgeURL})`);
} else {
    // Add badge to the end of the README
    readmeContent += `\n${badgeSection}`;
}

// Write updated content back to README.md
fs.writeFileSync(readmeFilePath, readmeContent, 'utf8');
console.log('README.md updated with the new average loop time badge.');

console.log('Closing the database connection...');
await connection.end();
