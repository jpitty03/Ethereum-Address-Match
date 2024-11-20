import mysql from 'mysql2/promise';
import fs from 'fs';

import { generateIdentitiesAndWriteToFile } from './utils/generateIds.js';


// Usage: generate 100 identities and write to temp.json file
let x = 0;
const maxRuns = -1 // Set to -1 to run continuously
const tempFile = 'riches/temp.json'
const richesFiles = 'riches/riches.json'
const host = process.env.DATABASE_HOST
console.log(host);


const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'eth'
});

console.log('Connecting to database...');
                await connection.connect();
while (x < maxRuns || maxRuns == -1) {

    try {
        const startTime = new Date();
        console.log(startTime)
        await generateIdentitiesAndWriteToFile(tempFile);

        // Read the contents of temp.json and extract addresses
        const tempData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
        const addressesToMatch = tempData.map(item => item.address);

        // Function to match addresses in temp.json with addresses
        async function matchAddresses() {
            try {
                // Connect to the MySQL database
                

                // Prepare the SQL query to find matches
                const placeholders = addressesToMatch.map(() => '?').join(',');
                const query = `
        SELECT * FROM wallets WHERE address IN (${placeholders})
        `;

                // Execute the query
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

    x++;
    console.log('Number of records processed: ' + x * 10000);
}

// Close the database connection
console.log('Closing the database connection...');
await connection.end();









