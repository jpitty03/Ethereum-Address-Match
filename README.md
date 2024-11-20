# Ethereum Wallets Importer

This project imports Ethereum wallet data into a MySQL database for analysis. The data is sourced from Google BigQuery and processed for efficient storage and querying.

## Average Loop Time
![Average Loop Time](https://img.shields.io/badge/average_loop_time-15.07s-brightgreen)
![Release Version](https://img.shields.io/badge/release-1.0.1-blue)
![Records Per Loop](https://img.shields.io/badge/records_per_loop-10000-orange)

## Prerequisites

1. **Install MySQL Server**
   - Download and install the MySQL server from [MySQL Downloads](https://dev.mysql.com/downloads/installer/).
   - During the installation, set a **root password**.
   - Log into MySQL through terminal: **mysql -u root -p**
   - Create a database named `eth`:
     ```sql
     CREATE DATABASE eth;
     ```
   - Create two tables: `wallets` and `wallets_t`:
     ```sql
     CREATE TABLE wallets (
         address VARCHAR(255) NOT NULL,
         eth_balance DECIMAL(30,0),
         PRIMARY KEY (address)
     );
     ```
   
2. **Install Node.js**
   - Download and install Node.js from [Node.js Downloads](https://nodejs.org/).
   - Install the required dependencies:
     ```bash
     npm install
     ```

2. **Edit Environment File**
   - Edit the .env file to match your data

## Steps to Use

### 1. Fetch Ethereum Address Data
   - Use **Google BigQuery** to retrieve Ethereum wallet addresses with significant balances:
     ```sql
     SELECT `address`, `eth_balance`
     FROM `bigquery-public-data.crypto_ethereum.balances`
     WHERE `eth_balance` >  2000000.0e18
     ORDER BY `eth_balance` DESC;
     ```
   - Export the query results as CSV files to a Google Cloud Storage bucket.
   - Download the CSV files to your local machine.

### 2. Process the CSV Files
   - Run the Python script `split_csv.py` to split the large CSV file into smaller chunks for easier processing:
     ```bash
     python split_csv.py
     ```

### 3. Import CSV Files to MySQL
   - Update the file path for your CSV files in `server_utils.js`.
   - Import the CSV files into the `wallets` table in MySQL. For example:
     ```sql
     LOAD DATA LOCAL INFILE 'C:/Users/username/pathToCsv.csv'
     INTO TABLE wallets
     FIELDS TERMINATED BY ',' 
     ENCLOSED BY '"'
     LINES TERMINATED BY '\n'
     IGNORE 1 ROWS
     (address, eth_balance);
     ```
     - Or execute utils/server_utils.js:
     ```bash
     node utils/server_utils.js
     ```

### 4. Run the Main Script
   - Execute `main.js` to process and analyze the data:
     ```bash
     node main.js
     ```

## Additional Notes
- Ensure your MySQL server is configured to allow local file imports. You may need to enable the `LOCAL_INFILE` option.
- Modify paths in `server_utils.js` and other scripts as needed to match your local environment.

## License
This project is licensed under the [MIT License](LICENSE).

