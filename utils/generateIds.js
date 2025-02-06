import fs from 'fs';
import EthCrypto from 'eth-crypto';
import dotenv from 'dotenv'
dotenv.config();

// Asynchronous wrapper around generateIdentitiesAndWriteToFile
export async function generateIdentitiesAndWriteToFile(filename) {
    return new Promise((resolve, reject) => {
        const identities = [];
        for (let i = 1; i <= process.env.RECORDS; i++) {
            const identity = EthCrypto.createIdentity();
            const objectWithUniqueKey = { ...identity, uniqueKey: i };
            identities.push(objectWithUniqueKey);
        }

        /*
        Push testId to the end of your json for testing.
        Be sure to run the query below to add the test address
        INSERT INTO wallets (address, eth_balance) VALUES ('0x2020202020202020202020202020202020202020', 1151515515155151515151);
        */

        // const testId = {
        //     privateKey: '0x101010101010101010101010101010101010101010101010101010101010010',
        //     publicKey: '5cdb1301bd102fa9d0f2ff0d37b953b12b19f921714b1ae6b2b713973c071dc8c40e3ee01b1d7cec7b152d4a96004ee861913fab914864b54a88700a7060cb53',
        //     address: '0x2020202020202020202020202020202020202020',
        //     uniqueKey: 20202020
        //   };
        
        // identities.push(testId);

        const jsonString = JSON.stringify(identities, null, 2);
        fs.writeFile(filename, jsonString, (err) => {
            if (err) {
                console.error(`Error writing to ${filename}:`, err);
                reject(err);
            } else {
                console.log(`Identities written to ${filename}`);
                resolve();
            }
        });
    });
}

// Function to clear contents of temp.json file
export function clearFile(filename) {
    fs.writeFile(filename, '', (err) => {
        if (err) {
            console.error(`Error clearing ${filename}:`, err);
        } else {
            console.log(`${filename} cleared`);
        }
    });
}
