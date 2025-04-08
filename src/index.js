console.log("🔥 Starting Order Service");
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config/config'); // ✅ use the config file

const app = express();
app.use(express.json());

const CATALOG_URL = config.services.catalog; // ✅ now using config.js

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Order Service healthy' });
});

// Purchase Endpoint
app.post('/purchase/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  try {
    // Step 1: Get item info from catalog
    const infoRes = await axios.get(`${CATALOG_URL}/info/${itemId}`);
    const book = infoRes.data;

    if (!book || book.quantity <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Item out of stock or not found',
      });
    }

    // Step 2: Update catalog with decremented quantity
    const newQuantity = book.quantity - 1;
    await axios.put(`${CATALOG_URL}/update/${itemId}`, {
      quantity: newQuantity,
    });

    // Step 3: Log the purchase
    const logLine = `${new Date().toISOString()},${itemId},"${book.title}",${book.price}\n`;
    const logPath = path.join(__dirname, 'orders.csv');
    fs.appendFileSync(logPath, logLine);

    // Step 4: Return success
    res.json({
      status: 'success',
      message: `bought book ${book.title}`,
    });
  } catch (err) {
    console.error('Purchase failed:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process purchase',
    });
  }
});

// Start server using config
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
