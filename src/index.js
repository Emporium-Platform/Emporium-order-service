const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

const app = express();
app.use(express.json());

const CATALOG_URL = config.services.catalog;

app.get('/health', (req, res) => {
  res.json({ status: 'Order Service healthy' });
});

app.post('/purchase/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  try {
    const infoRes = await axios.get(`${CATALOG_URL}/info/${itemId}`);
    const book = infoRes.data;

    if (!book || book.quantity <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Item out of stock or not found',
      });
    }

    const newQuantity = book.quantity - 1;
    await axios.put(`${CATALOG_URL}/update/${itemId}`, {
      quantity: newQuantity,
    });

    const logLine = `${new Date().toISOString()},${itemId},"${book.title}",${book.price}\n`;
    const logPath = path.join(__dirname, 'orders.csv');
    fs.appendFileSync(logPath, logLine);

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

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
