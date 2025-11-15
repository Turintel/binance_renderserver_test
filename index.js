// Import the required libraries
const express = require('express');
const cors = require('cors');

// Create the express app
const app = express();
// Render sets the 'PORT' environment variable. We use 3000 for local testing.
const PORT = process.env.PORT || 3000;

// Use the 'cors' middleware.
// This adds the 'Access-Control-Allow-Origin: *' header for us.
app.use(cors());

// This is our one and only API endpoint
app.get('/api/klines', async (req, res) => {
  // Get query params, with defaults
  const symbol = req.query.symbol || 'BTCUSDT';
  const interval = req.query.interval || '1d';
  const limit = req.query.limit || '1000';

  // Build the Binance URL.
  // We use api.binance.com because our server will be in Germany.
  const binanceURL = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    // We use the built-in 'fetch' (available in Node 18+)
    const response = await fetch(binanceURL);
    if (!response.ok) {
      throw new Error(`Binance API Error: ${response.status} ${response.statusText}`);
    }
    
    const klines = await response.json(); // Gets: [[time, o, h, l, c, v], ...]

    // Format the data for KLineChart (same logic as before)
    const formattedData = klines.map(k => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));

    // Send the clean data back to the frontend
    res.json(formattedData);

  } catch (error) {
    // Send back a clean error
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
