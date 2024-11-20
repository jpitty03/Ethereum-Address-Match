import fs from 'fs/promises';
import csvParser from 'csv-parser';
import mysql from 'mysql2/promise';

const db_config = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'eth'
};

const connection = await mysql.createConnection(db_config);
const csvDir = 'C:\\Users\\jpitt\\Downloads\\split_files';

try {
    const files = await fs.readdir(csvDir);

    for (const file of files) {
        if (file.endsWith('.csv')) {
            const filePath = `${csvDir}/${file}`;
            await loadCSVFile(filePath, connection);
        }
    }
} catch (err) {
    console.error('Error reading CSV directory:', err);
} finally {
    await connection.end();
}

async function loadCSVFile(filePath, connection) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        for (const line of lines.slice(1)) { // Skip header
            const [address, eth_balance] = line.split(','); // Assuming CSV format is address,eth_balance
            await connection.query('INSERT INTO wallets (address, eth_balance) VALUES (?, ?)', [address, eth_balance]);
            console.log(`Inserted row with address ${address} into wallets table`);
        }
    } catch (err) {
        console.error('Error processing CSV file:', err);
    }
}

// MySQL connection configuration
export const searchConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'eth'
  });
