import fs from 'fs';
import EthCrypto from 'eth-crypto';

// Asynchronous wrapper around generateIdentitiesAndWriteToFile
export async function generateIdentitiesAndWriteToFile(filename) {
    return new Promise((resolve, reject) => {
        const identities = [];
        for (let i = 1; i <= 10; i++) {
            const identity = EthCrypto.createIdentity();
            const objectWithUniqueKey = { ...identity, uniqueKey: i };
            identities.push(objectWithUniqueKey);
        }

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
