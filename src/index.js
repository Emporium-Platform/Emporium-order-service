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

    const timestamp = new Date().toISOString();
    const logLine = `${timestamp},${itemId},"${book.title}",${book.price}\n`;
    const logPath = path.join(__dirname, 'orders.csv');
    fs.appendFileSync(logPath, logLine);

    try {
      await axios.post(config.services.replica + '/replicate', {
        itemId,
        title: book.title,
        price: book.price,
        timestamp
      });
      console.log(`✔️ Replicated to ${config.services.replica}`);
    } catch (replicationErr) {
      console.warn(' Replication failed:', replicationErr.message);
    }

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


app.post('/replicate', (req, res) => {
  const { itemId, title, price, timestamp } = req.body;
  try {
    const logLine = `${timestamp},${itemId},"${title}",${price}\n`;
    const logPath = path.join(__dirname, 'orders.csv');
    fs.appendFileSync(logPath, logLine);

    res.status(200).json({ status: 'replicated', message: 'Purchase replicated successfully' });
  } catch (err) {
    console.error('Replication failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to replicate purchase' });
  }
});


const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
