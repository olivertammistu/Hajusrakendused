const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

let inventoryData = [];

const loadInventoryData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream('LE.txt')
      .pipe(csv({ separator: '\t', quote: '"' }))
      .on('data', (row) => {
        inventoryData.push({
          partId: row["00002356517"],
          name: row["Valuveljed "],
          price: row["90,833"],
          brand: row["KIA"],
          quantity: row["109"]
        });
      })
      .on('end', () => {
        console.log('CSV file successfully loaded into memory.');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error loading CSV file:', err);
        reject(err);
      });
  });
};

loadInventoryData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });

app.get('/check-part', (req, res) => {
  const partId = req.query.partId;

  if (!partId) {
    return res.status(400).json({ error: 'partId is required' });
  }

  const part = inventoryData.find((item) => item.partId === partId);

  if (part) {
    res.json(part);
  } else {
    res.status(404).json({ error: 'Part not found' });
  }
});