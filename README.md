# Ethereum Wallets Importer

This project imports Ethereum wallet data into a MySQL database for analysis. The data is sourced from Google BigQuery and processed for efficient storage and querying.

## Average Loop Time
![Average Loop Time](https://img.shields.io/badge/average_loop_time-24.77s-brightgreen)
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
     USE eth;
     ```
   - Create two tables: `wallets` and `wallets_t`:
     ```sql
     CREATE TABLE wallets_t (
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
     WHERE `eth_balance` >  2.0e14
     ORDER BY `eth_balance` DESC;
     ```
   - Export the query results as CSV files to a Google Cloud Storage bucket.
   - Download the CSV files to your local machine.

### 2. Process the CSV Files
   - Run the Python script `split_csv.py` to split the large CSV file into smaller chunks for easier processing:
   - Edit the directories in /utils/split_csv.py to point the input/output files to the correct directory
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

## About This Research Project

This project is a research initiative designed to demonstrate the vast scale of the Ethereum blockchain and its network of addresses. By importing Ethereum wallet data into a MySQL database and performing matching operations, we can better understand the challenges involved in processing and analyzing blockchain data.

The Ethereum blockchain contains approximately **8.4 million active addresses**. This project processes addresses in batches of **10,000 records at a time** and attempts to find matches in the database. Here's a breakdown of the computation and time estimation:

### Mathematical Analysis

#### Time Analysis

- **Total Records to Process:** 8,400,000 active Ethereum addresses.
- **Batch Size:** 10,000 randomly generated addresses.
- **Total Batches:** 8,400,000 ÷ 10,000 = 840.
- **Average Time per Batch:** 15 seconds.

- **Total Time to Process All Batches:**  
  Total Time (seconds) = Total Batches × Average Time per Batch  
  840 × 15 = 12,600 seconds.

- **Convert to Hours:**  
  Total Time (hours) = Total Time (seconds) ÷ 3600  
  12,600 ÷ 3600 ≈ 3.5 hours.

#### Probability of Finding a Match

- **Ethereum Address Space:** Ethereum uses a 160-bit address space, which equals approximately 1.46 × 10⁴⁸ possible addresses.
- **Active Addresses in Dataset:** 8.4 million.

- **Probability of a Match for a Single Random Address:**  
  Probability = Active Addresses ÷ Total Ethereum Address Space  
  Probability ≈ 8.4 million ÷ 1.46 × 10⁴⁸  
  Probability ≈ 5.75 × 10⁻⁴².

- **Probability of Finding a Match in a Batch of 10,000 Random Addresses:**  
  Even with 10,000 random addresses, the probability of finding a match is effectively zero due to the immense size of the Ethereum address space.

#### Key Takeaways

1. **Improbability of Match:**  
   - The chance of randomly generating a private key that matches an active Ethereum address is astronomically low. The Ethereum address space is so large that brute-forcing a match is practically impossible.

2. **Cryptographic Security:**  
   - This project demonstrates the robustness of Ethereum's cryptographic design, highlighting the infeasibility of guessing active addresses.
---

## Insights from the Project

This research highlights:
1. The **sheer scale** of the Ethereum network and the computational effort required to process blockchain data.
2. The importance of **efficient batch processing** and database optimization when working with large datasets.
3. The potential for leveraging **AI/ML models** to analyze patterns in wallet activity or transaction data for faster insights.

By processing Ethereum addresses in this manner, this project provides a foundation for more advanced blockchain analytics, demonstrating the feasibility of handling massive datasets at scale.

## License
This project is licensed under the [MIT License](LICENSE).

